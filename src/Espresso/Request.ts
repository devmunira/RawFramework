import { ALLOWED_METHODS_PARSE_BODY } from "./config";
import { IncomingMessage } from "http";
import {
  HTTPMethods,
  IRequest,
  RecordString,
  MultipartFormData,
  FileData,
} from "./types";
import { parse } from "node:url";

export class Request implements IRequest {
  path: string;
  query: RecordString;
  method: HTTPMethods;
  headers: RecordString;
  body: string | object | MultipartFormData | null = null;
  declarationPath: string = "";
  params: RecordString = {};

  constructor(public nodeRequest: IncomingMessage) {
    this.method = nodeRequest.method as HTTPMethods;
    this.headers = nodeRequest.headers as RecordString;
    const parseUrl = parse(nodeRequest.url!, true);
    this.path = parseUrl.pathname!;
    this.query = parseUrl.query as RecordString;
  }

  private parseMultipartFormData(
    buffer: Buffer,
    contentType: string
  ): MultipartFormData {
    // Extract boundary from content-type header - handle different formats
    // Try multiple regex patterns to catch different boundary formats
    let boundaryMatch = contentType.match(/boundary=(.+)$/i);

    if (!boundaryMatch) {
      // Try with quotes
      boundaryMatch = contentType.match(/boundary="([^"]+)"/i);
    }

    if (!boundaryMatch) {
      // Try with semicolon separator
      boundaryMatch = contentType.match(/boundary=([^;]+)/i);
    }

    if (!boundaryMatch) {
      // Try to find boundary anywhere in the string
      boundaryMatch = contentType.match(/boundary=([^\s;"]+)/i);
    }

    let boundary: string;

    if (!boundaryMatch) {
      // Fallback: try to extract boundary from the buffer itself
      const bufferStart = buffer.toString(
        "utf8",
        0,
        Math.min(200, buffer.length)
      );

      // Look for the first boundary in the buffer
      const boundaryInBuffer = bufferStart.match(/--([^\r\n]+)/);
      if (boundaryInBuffer) {
        boundary = boundaryInBuffer[1];
      } else {
        throw new Error(
          "No boundary found in content-type header or buffer: " + contentType
        );
      }
    } else {
      boundary = boundaryMatch[1];
    }

    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const endBoundaryBuffer = Buffer.from(`--${boundary}--`);

    const fields: RecordString = {};
    const files: Record<string, FileData> = {};

    // Split the buffer by boundary
    const parts = this.splitBufferByBoundary(
      buffer,
      boundaryBuffer,
      endBoundaryBuffer
    );

    for (const part of parts) {
      if (part.length === 0) continue;

      // Find the double CRLF that separates headers from content
      const headerEndIndex = part.indexOf(Buffer.from("\r\n\r\n"));
      if (headerEndIndex === -1) continue;

      const headersBuffer = part.subarray(0, headerEndIndex);
      const contentBuffer = part.subarray(headerEndIndex + 4);

      // Parse headers
      const headers = this.parseHeaders(headersBuffer.toString());
      const contentDisposition = headers["content-disposition"];

      if (!contentDisposition) continue;

      // Extract field name and filename
      const nameMatch = contentDisposition.match(/name="([^"]+)"/);
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);

      if (!nameMatch) continue;

      const fieldName = nameMatch[1];

      if (filenameMatch) {
        // This is a file upload
        const filename = filenameMatch[1];
        const fileData: FileData = {
          filename,
          contentType: headers["content-type"] || "application/octet-stream",
          data: contentBuffer,
          size: contentBuffer.length,
        };
        files[fieldName] = fileData;
      } else {
        // This is a regular form field
        fields[fieldName] = contentBuffer.toString();
      }
    }

    return { fields, files };
  }

  private splitBufferByBoundary(
    buffer: Buffer,
    boundary: Buffer,
    endBoundary: Buffer
  ): Buffer[] {
    const parts: Buffer[] = [];
    let startIndex = 0;

    while (true) {
      const boundaryIndex = buffer.indexOf(boundary, startIndex);
      if (boundaryIndex === -1) break;

      // Check if this is the end boundary
      const isEndBoundary = buffer
        .subarray(boundaryIndex, boundaryIndex + endBoundary.length)
        .equals(endBoundary);

      if (startIndex > 0) {
        // Extract the part between boundaries (excluding the boundary itself)
        const partEndIndex = boundaryIndex - 2; // Remove \r\n before boundary
        if (partEndIndex >= startIndex) {
          parts.push(buffer.subarray(startIndex, partEndIndex));
        }
      }

      if (isEndBoundary) break;

      // Move past the boundary and \r\n
      startIndex = boundaryIndex + boundary.length + 2;
    }

    return parts;
  }

  private parseHeaders(headersString: string): RecordString {
    const headers: RecordString = {};
    const lines = headersString.split("\r\n");

    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex !== -1) {
        const key = line.substring(0, colonIndex).toLowerCase().trim();
        const value = line.substring(colonIndex + 1).trim();
        headers[key] = value;
      }
    }

    return headers;
  }

  async parseBody() {
    if (!ALLOWED_METHODS_PARSE_BODY.includes(this.method)) {
      this.body = null;
      return;
    }

    const contentType = this.headers["content-type"];
    if (!contentType) {
      this.body = null;
      return;
    }

    const contentTypeLower = contentType.toLowerCase();
    if (!contentTypeLower) {
      this.body = null;
      return;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of this.nodeRequest) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    if (contentTypeLower === "application/json") {
      try {
        this.body = JSON.parse(buffer.toString());
        return;
      } catch (error) {
        this.body = null;
        return;
      }
    } else if (contentTypeLower === "text/plain") {
      this.body = buffer.toString();
      return;
    } else if (contentTypeLower === "application/x-www-form-urlencoded") {
      try {
        const urlEncodedData = new URLSearchParams(buffer.toString());
        this.body = Object.fromEntries(urlEncodedData.entries());
        return;
      } catch {
        this.body = null;
        return;
      }
    } else if (contentTypeLower.startsWith("multipart/form-data")) {
      try {
        this.body = this.parseMultipartFormData(buffer, contentType);
        return;
      } catch (error) {
        console.error("Error parsing multipart form data:", error);
        this.body = null;
        return;
      }
    } else {
      this.body = null;
      return;
    }
  }
}

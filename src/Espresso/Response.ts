import { ServerResponse, IncomingMessage } from "http";
import { IResponse, RecordString } from "./types";

export class Response implements IResponse {
  statusCode: number = 200;
  headers: RecordString = {};

  constructor(public nodeResponse: ServerResponse<IncomingMessage>) {}

  status(code: number): this {
    this.statusCode = code;
    return this;
  }
  setHeaders(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  send(body: string | object | Buffer | null | File): this {
    if (this.nodeResponse.writableEnded) return this;

    if (typeof body === "object" && !(body instanceof Buffer)) {
      this.setHeaders("Content-Type", "application/json");
      this.nodeResponse.writeHead(this.statusCode, this.headers);
      this.nodeResponse.end(JSON.stringify(body));
      return this;
    }

    if (body instanceof Buffer) {
      this.setHeaders("Content-Type", "application/octet-stream");
      this.nodeResponse.writeHead(this.statusCode, this.headers);
      this.nodeResponse.end(body);
      return this;
    }

    this.nodeResponse.writeHead(this.statusCode, this.headers);
    this.nodeResponse.end(body);
    return this;
  }

  json(body: object): this {
    if (this.nodeResponse.writableEnded) return this;

    if (typeof body === "object" && !(body instanceof Buffer)) {
      this.setHeaders("Content-Type", "application/json");
      this.nodeResponse.writeHead(this.statusCode, this.headers);
      this.nodeResponse.end(JSON.stringify(body));
      return this;
    }

    this.nodeResponse.writeHead(this.statusCode, this.headers);
    this.nodeResponse.end(body);
    return this;
  }

  view(body: File): this {
    throw new Error("Method not implemented.");
  }
}

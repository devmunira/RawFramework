import { ServerResponse, IncomingMessage } from "http";
import { IResponse, RecordString } from "./types";
import fs from "fs";
import { TemplateEngine } from "./lib/template-engine";

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

  stream(readable: NodeJS.ReadableStream): this {
    if (!this.nodeResponse.writableEnded) {
      this.nodeResponse.writeHead(this.statusCode, this.headers);
    }
    readable.pipe(this.nodeResponse);
    return this;
  }

  pipe(readable: NodeJS.ReadableStream): this {
    this.stream(readable);
    return this;
  }

  async render(template: string, data: object) {
    const templateEngine = new TemplateEngine();
    await templateEngine.renderToStream(template, data, this.nodeResponse);
    return this;
  }

  redirect(url: string) {
    this.setHeaders("Location", url);
    this.status(302).send("Redirecting to " + url);
    return this;
  }

  type(contentType: string) {
    this.setHeaders("Content-Type", contentType);
    return this;
  }

  attachment(fileName: string) {
    this.setHeaders(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );
    return this;
  }

  etag(etag: string) {
    this.setHeaders("ETag", etag);
    return this;
  }

  view(path: string) {
    this.setHeaders("Content-Type", "application/octet-stream");
    this.nodeResponse.writeHead(this.statusCode, this.headers);

    const stream = fs.createReadStream(path);
    stream.pipe(this.nodeResponse);

    stream.on("error", () => {
      this.nodeResponse.statusCode = 404;
      this.nodeResponse.end("File not found");
    });

    stream.on("end", () => {
      this.nodeResponse.end();
    });

    return this;
  }
}

import { Response } from "./Response";
import { IncomingMessage, ServerResponse } from "node:http";
import { Request } from "./Request";

/***
 * Allowed methods: get, post, put, patch, delete
 */
export type HTTPMethods =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS";

// File data interface for multipart form data
export interface FileData {
  filename: string;
  contentType: string;
  data: Buffer;
  size: number;
}

// Multipart form data interface
export interface MultipartFormData {
  fields: RecordString;
  files: Record<string, FileData>;
}

// Types of Custom request that we gonna expose for our applications
export interface IRequest {
  nodeRequest: IncomingMessage;
  path: string;
  declarationPath: string;
  method: HTTPMethods;
  query: RecordString;
  params: RecordString;
  headers: RecordString;
  body: string | null | object | MultipartFormData;
}

// Types of Custom response that we gonna expose for our applications
export interface IResponse {
  nodeResponse: ServerResponse;
  statusCode: number;
  headers: RecordString;
  status(code: number): this;
  setHeaders(key: string, value: string): this;
  send(body: string | object | Buffer | null | File): this;
  json(body: object): this;
  view(body: File): this;
}

// Types of routes
export type IRouter<T> = {
  path: string;
  method: HTTPMethods;
  middlewares: [];
  handler: () => T | Promise<T>;
};

// Request Handler Type
export type Handler = (
  req: Request,
  res: Response,
  next?: NextFunction
) => void | Promise<void>;

export type NextFunction = {
  (error?: Error): void;
};

// Custom type
export type RecordString = Record<string, string>;

export type TMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type Middlewares = {
  path: string;
  middleware: TMiddleware;
};

export interface IMiddlewares {
  use: (
    pathOrMiddleware: string | TMiddleware[],
    middleware?: TMiddleware[]
  ) => void | Promise<void>;

  execute: (
    req: Request,
    res: Response,
    handler: Handler
  ) => void | Promise<void>;
}

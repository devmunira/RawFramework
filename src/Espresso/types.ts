import { IncomingMessage, ServerResponse } from "node:http";

/***
 * Allowed methods: get, post, put, patch, delete
 */
export type HTTPMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Types of Custom request that we gonna expose for our applications
export interface Request {
  nodeRequest: IncomingMessage;
  path: string;
  declarationPath: string;
  method: HTTPMethods;
  query: Record<string, string>;
  params: Record<string, string>;
  headers: Record<string, string>;
  body: string | null | object;
}

// Types of Custom response that we gonna expose for our applications
export interface Response {
  nodeResponse: ServerResponse;
  statusCode: number;
  headers: Record<string, string>;
  status(code: number): this;
  setHeaders(key: string, value: string): this;
  send(body: string | object | Buffer | null | File): this;
  json(body: object): this;
  view(body: File): this;
}

// Types of routes
export type Router<T> = {
  path: string;
  method: HTTPMethods;
  middlewares: [];
  handler: () => T | Promise<T>;
};

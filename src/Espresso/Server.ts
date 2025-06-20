import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { EventEmitter } from "node:events";
import { Request } from "./Request";
import { Response } from "./Response";
import { Router } from "./Router";
import { Handler, HTTPMethods } from "./types";

export class Server extends EventEmitter {
  private server: ReturnType<typeof createServer>;
  private router: Router;

  constructor() {
    super();
    this.server = createServer(this.requestHandler.bind(this));
    this.router = new Router();
  }

  private requestHandler = async (
    req: IncomingMessage,
    res: ServerResponse
  ) => {
    const request = new Request(req);
    const response = new Response(res);

    // parse body
    await request.parseBody();
    const body = request.body;

    // Route Matching
    const router = this.router.match(request.method, request.path);

    if (!router) {
      response.status(404).json({
        message: "Resources not found",
      });
      return;
    }

    const { handler, params, originalPath } = router;
    request.params = params || {};
    request.declarationPath = originalPath || "";
    handler(request, response);
  };

  get(path: string, handler: Handler) {
    this.router.add("GET", path, handler);
  }

  post(path: string, handler: Handler) {
    this.router.add("POST", path, handler);
  }

  patch(path: string, handler: Handler) {
    this.router.add("PATCH", path, handler);
  }

  put(path: string, handler: Handler) {
    this.router.add("PUT", path, handler);
  }

  delete(path: string, handler: Handler) {
    this.router.add("DELETE", path, handler);
  }

  listen(port: number, cb: () => void | Promise<void>) {
    this.server.listen(port, cb);
  }
}

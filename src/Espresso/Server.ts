import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { EventEmitter } from "node:events";
import { Request } from "./Request";
import { Response } from "./Response";
import { Router } from "./Router";
import { Handler, IMiddlewares, TMiddleware } from "./types";
import { Middleware } from "./Middleware";

export class Server extends EventEmitter {
  private server: ReturnType<typeof createServer>;
  private router: Router;
  private middleware: IMiddlewares;

  constructor() {
    super();
    this.server = createServer(this.requestHandler.bind(this));
    this.router = new Router();
    this.middleware = new Middleware();
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

    request.params = router?.params || {};
    request.declarationPath = router?.originalPath || "";

    const handler = router
      ? router.handler
      : () => {
          response.status(404).json({
            message: "Resources not found",
          });
          return;
        };

    await this.middleware.execute(request, response, handler);
  };

  use(path: string | TMiddleware[], middlewares: TMiddleware[] = []) {
    this.middleware.use(path, middlewares);
  }

  get(path: string, handler: Handler, middlewares: TMiddleware[] = []) {
    this.middleware.use(path, middlewares);
    this.router.add("GET", path, handler);
  }

  post(path: string, handler: Handler, middlewares: TMiddleware[] = []) {
    this.middleware.use(path, middlewares);
    this.router.add("POST", path, handler);
  }

  patch(path: string, handler: Handler, middlewares: TMiddleware[] = []) {
    this.middleware.use(path, middlewares);
    this.router.add("PATCH", path, handler);
  }

  put(path: string, handler: Handler, middlewares: TMiddleware[] = []) {
    this.middleware.use(path, middlewares);
    this.router.add("PUT", path, handler);
  }

  delete(path: string, handler: Handler, middlewares: TMiddleware[] = []) {
    this.middleware.use(path, middlewares);
    this.router.add("DELETE", path, handler);
  }

  listen(port: number, cb: () => void | Promise<void>) {
    this.server.listen(port, cb);
  }
}

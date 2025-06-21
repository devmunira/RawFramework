import { Request } from "./Request";
import { Response } from "./Response";
import { Handler, IMiddlewares, TMiddleware, Middlewares } from "./types";

export class Middleware implements IMiddlewares {
  private middlewares: Middlewares[] = [];

  use(
    pathOrMiddleware: string | TMiddleware[],
    middleware: TMiddleware[] = []
  ): void | Promise<void> {
    // Router Middlewares
    if (typeof pathOrMiddleware === "string") {
      if (middleware?.length <= 0) return;

      middleware.forEach((handler) => {
        this.middlewares.push({
          path: pathOrMiddleware,
          middleware: handler,
        });
      });
      return;
    }

    // Global Middlewares
    if (pathOrMiddleware?.length <= 0) return;
    (pathOrMiddleware as TMiddleware[])?.forEach((handler) => {
      this.middlewares.push({
        path: "",
        middleware: handler,
      });
    });
  }

  async execute(req: Request, res: Response, handler: Handler) {
    let index = 0;
    const next = async (error?: Error) => {
      if (error) {
        res.status(500).json({
          message: error?.message,
          stack: error?.stack,
        });
      }

      if (res.nodeResponse?.writableEnded) return;

      if (index >= this.middlewares.length) {
        await handler(req, res, next);
        return;
      }

      const { path, middleware } = this.middlewares[index++];
      console.log({ path, middleware });

      if (path && !req.declarationPath.startsWith(path)) {
        console.log("Not Execute", { path, dec: req.declarationPath });
        await next();
        return;
      }

      await middleware(req, res, next);
      console.log("Execute", path);
    };
    await next();
  }
}

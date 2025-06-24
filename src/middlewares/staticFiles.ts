import { Request, Response } from "../Espresso/index";
import path from "path";
import fs from "fs";
import { IMiddlewares, NextFunction } from "@src/Espresso/types";

export function staticFiles(publicPath: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") {
      next();
    }

    const filePath = path.join(publicPath, req.path);

    try {
      const stats = fs.statSync(filePath);

      if (!stats.isFile()) {
        return next();
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType =
        {
          ".html": "text/html",
          ".css": "text/css",
          ".js": "application/javascript",
          ".json": "application/json",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".gif": "image/gif",
          ".svg": "image/svg+xml",
          ".ico": "image/x-icon",
        }[ext] || "application/octet-stream";

      res.setHeaders("Content-Type", contentType);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res.nodeResponse);

      fileStream.on("error", (error) => {
        if (error instanceof Error && error.message.includes("ENOENT")) {
          next();
        } else {
          next(error as Error);
        }
      });

      fileStream.on("end", () => {
        res.nodeResponse.end();
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("ENOENT")) {
        next();
      } else {
        next(error as Error);
      }
    }
  };
}

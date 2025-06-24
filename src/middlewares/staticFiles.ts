import { Request, Response } from "../Espresso/index";
import path from "path";
import fs from "fs";
import { IMiddlewares, NextFunction } from "@src/Espresso/types";

export function staticFiles(publicPath: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") {
      return next();
    }

    const filePath = path.join(publicPath, req.path);

    // Debug logging
    console.log(`Static file request: ${req.path}`);
    console.log(`Looking for file at: ${filePath}`);
    console.log(`Public path: ${publicPath}`);

    try {
      const stats = fs.statSync(filePath);

      if (!stats.isFile()) {
        console.log(`Not a file: ${filePath}`);
        return next();
      }

      console.log(`Serving file: ${filePath}`);

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
          ".pdf": "application/pdf",
        }[ext] || "application/octet-stream";

      res.setHeaders("Content-Type", contentType);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res.nodeResponse);

      fileStream.on("error", (error) => {
        console.error(`File stream error: ${error}`);
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
      console.error(`Static file error: ${error}`);
      if (error instanceof Error && error.message.includes("ENOENT")) {
        next();
      } else {
        next(error as Error);
      }
    }
  };
}

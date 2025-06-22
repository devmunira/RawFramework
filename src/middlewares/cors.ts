import { Response } from "./../Espresso/Response";
import { Request } from "./../Espresso/Request";
import { NextFunction, TMiddleware } from "../Espresso/types";

type CorsOptions = {
  origin?: string | string[] | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
};

const isAllowedOrigin = (origin: string, options: CorsOptions) => {
  if (options.origin === "*") return true;

  if (typeof options.origin === "function") {
    return options.origin(origin);
  }

  if (Array.isArray(options.origin)) {
    return options.origin.includes(origin);
  }

  return options.origin === origin;
};

export const cors = (options: CorsOptions = {}): TMiddleware => {
  const defaultOptions: CorsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  };

  const corsOptions = {
    ...defaultOptions,
    ...options,
  };

  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers["origin"];

    if (origin && isAllowedOrigin(origin, corsOptions)) {
      res.setHeaders("Access-Control-Allow-Origin", origin);
    }

    if (corsOptions.credentials) {
      res.setHeaders("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      res.setHeaders(
        "Access-Control-Allow-Methods",
        corsOptions.methods?.join(", ") || ""
      );
      res.setHeaders(
        "Access-Control-Allow-Headers",
        corsOptions.allowedHeaders?.join(", ") || ""
      );

      res.status(204).send("");
      return;
    }

    next();
  };
};

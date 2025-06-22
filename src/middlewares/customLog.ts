import { NextFunction, TMiddleware } from "@src/Espresso/types";
import { Request, Response } from "@src/Espresso";
import {
  Logger,
  LogLevel,
  RequestFormatter,
  ConsoleTransporter,
} from "../Espresso/lib/logger";

type MyMorganOptions = {
  logger?: Logger;
  logRequestBody?: boolean;
  logResponseBody?: boolean;
  logRequestHeaders?: boolean;
  logResponseTime?: boolean;
  logResponseStatus?: boolean;
  logMeta?: boolean;
};

export const CustomLogger = (options: MyMorganOptions = {}): TMiddleware => {
  const {
    logger = new Logger({
      transporters: [new ConsoleTransporter(new RequestFormatter())],
    }),
    logRequestBody = false,
    logResponseBody = false,
    logRequestHeaders = false,
    logResponseTime = true,
    logResponseStatus = true,
    logMeta = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = process.hrtime.bigint();
    const requestId = crypto.randomUUID();

    // Log Entry
    const logEntry: Record<string, any> = {
      requestId,
      method: req.method,
      path: req.path,
      originalPath: req.declarationPath,
      headers: req.headers,
      timestamp: new Date().toISOString(),
    };

    // Log Request Body
    const allowedMethods = ["POST", "PUT", "PATCH"];
    if (logRequestBody && allowedMethods.includes(req.method)) {
      let body = "";
      req.nodeRequest.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.nodeRequest.on("end", () => {
        try {
          logEntry.body = JSON.parse(body);
        } catch {
          logEntry.body = body;
        }
      });
    }

    const originalWrite = res.nodeResponse.write.bind(res.nodeResponse);
    const originalEnd = res.nodeResponse.end.bind(res.nodeResponse);

    let responseBody = "";
    res.nodeResponse.write = (chunk, ...args: any[]) => {
      responseBody += chunk.toString();
      return originalWrite(chunk, ...args);
    };

    res.nodeResponse.end = (chunk, ...args: any[]) => {
      if (chunk) {
        responseBody += chunk.toString();
      }

      if (logResponseTime) {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
        logEntry.responseTime = `${duration.toFixed(3)}ms`;
      }

      if (logResponseStatus) {
        logEntry.status = res.nodeResponse.statusCode;
      }

      if (logResponseBody) {
        try {
          logEntry.response = JSON.parse(responseBody);
        } catch {
          logEntry.response = responseBody;
        }
      }

      const logMessage = `${req.method} ${req.path} ${
        logResponseStatus ? res.nodeResponse.statusCode : ""
      } - ${logEntry.responseTime}`;

      // Determine the log level
      let statusLogLevel: LogLevel = "info";
      if (res.nodeResponse.statusCode >= 500) {
        statusLogLevel = "error";
      } else if (res.nodeResponse.statusCode >= 400) {
        statusLogLevel = "warn";
      } else if (res.nodeResponse.statusCode >= 300) {
        statusLogLevel = "info";
      } else if (res.nodeResponse.statusCode >= 200) {
        statusLogLevel = "info";
      }

      logger[statusLogLevel](logMessage, logEntry);
      if (logMeta) {
        console.log("Meta Data", logEntry);
      }

      if (logRequestHeaders) {
        console.log("Request Headers", req.headers);
      }

      return originalEnd(chunk, ...args);
    };

    next();
  };
};

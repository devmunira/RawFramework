import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { EventEmitter } from "node:events";

export class Server extends EventEmitter {
  private server: ReturnType<typeof createServer>;

  constructor() {
    super();
    this.server = createServer(this.requestHandler.bind(this));
  }

  private requestHandler = (req: IncomingMessage, res: ServerResponse) => {
    this.emit("request on", req.url);
    const path = req.url;
    const method = req.method;

    if (path === "/test" && method === "GET") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Hello Test World!",
        })
      );
    } else {
      res.writeHead(404, "Not Found", { "content-type": "text/plain" });
      res.end("Nothing Found");
    }
    this.emit("request off", res);
  };

  listen(port: number, cb: () => void | Promise<void>) {
    this.server.listen(port, cb);
  }
}

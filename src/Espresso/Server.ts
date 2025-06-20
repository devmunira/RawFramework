import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { EventEmitter } from "node:events";
import { Request } from "./Request";

export class Server extends EventEmitter {
  private server: ReturnType<typeof createServer>;

  constructor() {
    super();
    this.server = createServer(this.requestHandler.bind(this));
  }

  private requestHandler = async (
    req: IncomingMessage,
    res: ServerResponse
  ) => {
    const request = new Request(req);
    await request.parseBody();
    console.log(request.body);
    res.end("Done");
  };

  listen(port: number, cb: () => void | Promise<void>) {
    this.server.listen(port, cb);
  }
}

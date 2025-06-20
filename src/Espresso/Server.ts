import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { EventEmitter } from "node:events";
import { Request } from "./Request";
import { Response } from "./Response";

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
    const response = new Response(res);

    // parse body
    await request.parseBody();
    const body = request.body;

    // Route Matching

    response.send({ message: "Hello" });
  };

  listen(port: number, cb: () => void | Promise<void>) {
    this.server.listen(port, cb);
  }
}

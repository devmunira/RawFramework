import { Server } from "./Server";
export * from "./lib/logger/index";
export * from "./Request";
export * from "./Response";

export const createApp = () => new Server();

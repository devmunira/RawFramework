import { ConsoleTransporter } from "./Transporters";
import { LogEntry, LoggerOptions, LogLevel, Transporter } from "./types";

export class Logger {
  private transporters: Transporter[];
  private defaultMeta: Record<string, any>;

  constructor(options: LoggerOptions = {}) {
    this.transporters = options.transporters || [new ConsoleTransporter()];
    this.defaultMeta = options.defaultMeta || {};
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    meta: Record<string, any>
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...this.defaultMeta,
      ...meta,
    };
  }

  private log(level: LogLevel, message: string, meta: Record<string, any>) {
    const entry = this.createLogEntry(level, message, meta);
    this.transporters.forEach((transporter) => transporter.log(entry));
  }

  addTransporter(transporter: Transporter) {
    this.transporters.push(transporter);
  }

  debug(message: string, meta: Record<string, any> = {}) {
    this.log("debug", message, meta);
  }

  info(message: string, meta: Record<string, any> = {}) {
    this.log("info", message, meta);
  }

  warn(message: string, meta: Record<string, any> = {}) {
    this.log("warn", message, meta);
  }

  error(message: string, meta: Record<string, any> = {}) {
    this.log("error", message, meta);
  }
}

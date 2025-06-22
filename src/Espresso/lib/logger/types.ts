export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
};

export interface Formatter {
  format(entry: LogEntry): string;
}

export interface Transporter {
  log(entry: LogEntry): void;
}

export type LoggerOptions = {
  transporters?: Transporter[];
  defaultMeta?: Record<string, any>;
};

import { JSONFormatter, TextFormatter } from "./Formatters";
import { Formatter, LogEntry, Transporter } from "./types";
import fs from "fs";
import path from "path";

// Console Transporter
export class ConsoleTransporter implements Transporter {
  constructor(private formatter: Formatter = new TextFormatter()) {}

  log(entry: LogEntry): void {
    const formattedMessage = this.formatter.format(entry);
    process.stdout.write(formattedMessage);
  }
}

// File Transporter
export class FileTransporter implements Transporter {
  private formatter: Formatter;
  private logDir: string;
  private logFile: string;

  constructor(
    formatter: Formatter = new JSONFormatter(),
    options: {
      logDir?: string;
      logFile?: string;
    } = {}
  ) {
    this.formatter = formatter;
    this.logDir = options.logDir || "./logs";
    this.logFile = options.logFile || "app.log";

    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(entry: LogEntry): void {
    const formatted = this.formatter.format(entry);
    try {
      fs.appendFileSync(path.join(this.logDir, this.logFile), formatted);
    } catch (error) {
      console.error("Failed to write log file", error);
    }
  }
}

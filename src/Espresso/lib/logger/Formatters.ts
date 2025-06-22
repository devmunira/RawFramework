import { ConsoleColor } from "./ConsoleColor";
import { Formatter, LogEntry } from "./types";
import { formateDate } from "./utils";

export class JSONFormatter implements Formatter {
  format(entry: LogEntry): string {
    return JSON.stringify(entry) + "\n";
  }
}

export class TextFormatter implements Formatter {
  format(entry: LogEntry): string {
    const { level, message, timestamp, ...meta } = entry;

    const metaString = Object.keys(meta).length
      ? `\nMeta Data: ${ConsoleColor.colors.white}${JSON.stringify(meta)}${
          ConsoleColor.colors.reset
        }\n\n`
      : "";

    const colorizedMessage = ConsoleColor.colorize(level, message);
    const timestampString =
      ConsoleColor.colors.gray +
      formateDate(timestamp).padEnd(25, " ") +
      ConsoleColor.colors.reset;

    return `\n${timestampString} ${colorizedMessage}${metaString}`;
  }
}

export class RequestFormatter implements Formatter {
  format(entry: LogEntry): string {
    const { level, message, timestamp } = entry;
    const timestampString =
      ConsoleColor.colors.gray +
      formateDate(timestamp).padEnd(25, " ") +
      ConsoleColor.colors.reset;

    return `${timestampString} ${ConsoleColor.colorize(level, message)}\n`;
  }
}

import { LogLevel } from './types';

export class ConsoleColor {
	static readonly colors: Record<string, string> = {
		reset: '\x1b[0m',
		red: '\x1b[31m',
		green: '\x1b[32m',
		yellow: '\x1b[33m',
		blue: '\x1b[34m',
		magenta: '\x1b[35m',
		cyan: '\x1b[36m',
		white: '\x1b[37m',
		gray: '\x1b[90m',
	};

	static levelColors: Record<LogLevel, string> = {
		debug: ConsoleColor.colors.cyan,
		info: ConsoleColor.colors.green,
		warn: ConsoleColor.colors.yellow,
		error: ConsoleColor.colors.red,
	};

	static colorize(level: LogLevel, message: string) {
		const color = ConsoleColor.levelColors[level] || ConsoleColor.colors.reset;
		return `${color}${level.toUpperCase().padEnd(8, '')}: ${message}${
			ConsoleColor.colors.reset
		}`;
	}
}

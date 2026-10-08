import { env } from '@/config/env.config';
import pino, { type Logger } from 'pino';
import pinoPretty from 'pino-pretty';

let logger: Logger | null = null;

/** Structured logger (pino). Tetap tersedia tanpa infrastruktur observability apa pun. */
export function getLogger(): Logger {
  if (logger) return logger;

  const isProd = env.NODE_ENV === 'production';

  logger = pino(
    {
      level: env.LOG_LEVEL ?? 'info',
      base: undefined,
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    isProd
      ? undefined
      : pinoPretty({
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
          colorize: true,
          singleLine: true,
        }),
  );

  return logger;
}

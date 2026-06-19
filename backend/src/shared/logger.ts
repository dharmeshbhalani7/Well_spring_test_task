import pino from "pino";
import { env } from "../config/env";

export const logger = pino({
  level: env.LOG_LEVEL,
  formatters: {
    level: (label) => ({ level: label }),
  },
});

export function createRequestLogger(bindings: {
  request_id: string;
  tenant_id?: string;
  method?: string;
  path?: string;
}) {
  return logger.child(bindings);
}

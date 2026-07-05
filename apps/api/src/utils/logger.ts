// Structured console logging. Centralised so we can later swap in a real
// logging service (Datadog, etc.) without touching every call site.

// Formats a log line with timestamp and level. (Timestamp via Date is fine here —
// this is runtime logging, not deterministic workflow code.)
function format(level: string, message: string): string {
  return `[${new Date().toISOString()}] ${level} ${message}`;
}

export const logger = {
  // Routine information — server start, connections, etc.
  info(message: string, meta?: unknown) {
    console.log(format("INFO", message), meta ?? "");
  },
  // Something unexpected but non-fatal.
  warn(message: string, meta?: unknown) {
    console.warn(format("WARN", message), meta ?? "");
  },
  // An error we want visibility on. Logs full detail internally.
  error(message: string, error?: unknown) {
    console.error(format("ERROR", message), error ?? "");
  },
};

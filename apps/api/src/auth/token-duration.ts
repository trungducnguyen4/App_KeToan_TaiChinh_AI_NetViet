const DURATION_PATTERN = /^(\d+)(s|m|h|d)$/i;

export function parseDurationSeconds(value: string | undefined, fallbackSeconds: number): number {
  if (!value) {
    return fallbackSeconds;
  }

  const normalized = value.trim();
  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  const match = DURATION_PATTERN.exec(normalized);
  if (!match) {
    throw new Error(`Thời hạn token không hợp lệ: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = unit === "s" ? 1 : unit === "m" ? 60 : unit === "h" ? 3_600 : 86_400;

  return amount * multiplier;
}

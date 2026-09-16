export type SlaState = "safe" | "near-breach" | "breached";

const NEAR_BREACH_MINUTES = 15;

export function getSlaMinutesRemaining(
  slaDueAt: string,
  now: Date = new Date()
): number {
  return (new Date(slaDueAt).getTime() - now.getTime()) / 60_000;
}

export function getSlaState(
  slaDueAt: string,
  now: Date = new Date()
): SlaState {
  const minutesRemaining = getSlaMinutesRemaining(slaDueAt, now);
  if (minutesRemaining <= 0) return "breached";
  if (minutesRemaining <= NEAR_BREACH_MINUTES) return "near-breach";
  return "safe";
}

export function formatSlaCountdown(
  slaDueAt: string,
  now: Date = new Date()
): string {
  const minutesRemaining = getSlaMinutesRemaining(slaDueAt, now);
  if (minutesRemaining <= 0) {
    return "BREACHED";
  }
  const totalMinutes = Math.floor(minutesRemaining);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
}

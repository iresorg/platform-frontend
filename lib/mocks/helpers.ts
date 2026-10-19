// Shared by every lib/mocks/* module — a small fixed delay so these feel
// like network calls (loading skeletons actually show) rather than
// resolving in the same tick, and nothing else. No state is persisted:
// every call regenerates from the same seed data, so a mutation (e.g.
// "mark as done") only updates the in-memory array for this page load.
export function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let seed = 42;
// Deterministic-enough pseudo-random so the same mock dataset looks the
// same on every reload instead of reshuffling distractingly.
export function mockRandom(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

export function mockPick<T>(items: T[]): T {
  return items[Math.floor(mockRandom() * items.length)];
}

export function mockInt(min: number, max: number): number {
  return Math.floor(min + mockRandom() * (max - min + 1));
}

export function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

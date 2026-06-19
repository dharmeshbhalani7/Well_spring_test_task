export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins} min`;
  return `${mins}m ${secs}s`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function minutesToSeconds(minutes: number): number {
  return Math.round(minutes * 60);
}

export function secondsToMinutes(seconds: number): number {
  return Math.round(seconds / 60);
}

export function parseTagsInput(input: string): string[] {
  return input
    ?.split(",")
    ?.map((t) => t.trim())
    ?.filter(Boolean);
}

export function tagsToInput(tags: string[]): string {
  return tags?.join(", ") ?? "";
}

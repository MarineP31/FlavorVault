export function parseISO8601Duration(duration: string): number | null {
  if (!duration || typeof duration !== 'string') return null;

  const match = duration.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!match) return null;

  const days = parseInt(match[1] || '0', 10);
  const hours = parseInt(match[2] || '0', 10);
  const minutes = parseInt(match[3] || '0', 10);
  const seconds = parseInt(match[4] || '0', 10);

  const totalMinutes = days * 24 * 60 + hours * 60 + minutes + Math.round(seconds / 60);
  return totalMinutes > 0 ? totalMinutes : null;
}

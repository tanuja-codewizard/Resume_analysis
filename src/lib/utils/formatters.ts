/**
 * Consistently format growth percentages:
 * - Positive: "+X%"
 * - Negative: "-X%" (never "+-X%")
 * - Zero change: "0%"
 * - No baseline data: "--" (or "+100%" if first positive period)
 */
export function formatPercentageGrowth(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? '+100%' : '--';
  }
  const percentChange = Math.round(((current - previous) / previous) * 100);
  if (percentChange > 0) {
    return `+${percentChange}%`;
  }
  if (percentChange < 0) {
    return `${percentChange}%`;
  }
  return '0%';
}

export function formatAtsGrowth(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? '+100%' : '--';
  }
  const diff = current - previous;
  if (diff > 0) {
    return `+${diff}%`;
  }
  if (diff < 0) {
    return `${diff}%`;
  }
  return '0%';
}

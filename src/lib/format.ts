export const DISPLAY_CURRENCY = 'USDT';

export function formatAmount(value: number | string | null | undefined, decimals = 2): string {
  const numeric = Number(value ?? 0);

  if (!Number.isFinite(numeric)) {
    return (0).toFixed(decimals);
  }

  return numeric.toFixed(decimals);
}

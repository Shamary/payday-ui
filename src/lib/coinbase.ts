export function openCoinbaseWidget(url: string) {
  if (typeof window === 'undefined') {
    return;
  }

  // Open Coinbase OnRamp / OffRamp in a dedicated window to preserve app state.
  window.open(url, 'coinbase-onramp', 'width=500,height=800');
}

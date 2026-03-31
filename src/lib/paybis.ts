export function openPaybisWidget(widgetUrl: string) {
  if (typeof window === 'undefined') {
    return;
  }

  // Open Paybis in a dedicated tab/window so the user can complete KYC and
  // payment without losing the current app state.
  window.open(widgetUrl, 'paybis-widget', 'width=480,height=760');
}
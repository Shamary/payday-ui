export function openMtPelerinWidget(widgetUrl: string) {
  if (typeof window === 'undefined') {
    return;
  }

  // Open Mt Pelerin checkout in a dedicated window to preserve app state.
  window.open(widgetUrl, 'mtpelerin-widget', 'width=480,height=760');
}

export function openCoinbaseWidget(url: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const width = 520;
  const height = 800;
  const left = Math.max(0, Math.floor((window.screen.width - width) / 2));
  const top = Math.max(0, Math.floor((window.screen.height - height) / 2));
  const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;

  // Coinbase pages send frame-ancestors CSP headers that block iframe embedding.
  // Use a centered popup window for an in-flow checkout experience.
  window.open(url, 'coinbase-secure-flow', features);
}

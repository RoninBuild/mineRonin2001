export function shareResult(won: boolean, difficulty: string, timeSeconds: number) {
  const emoji = won ? '🥷' : '💥';
  const status = won ? 'Cleared' : 'Lost';
  const text = `${emoji} MINE RONIN – ${status} ${difficulty.toUpperCase()} in ${timeSeconds}s on Base`;

  if (navigator.share) {
    navigator.share({
      text,
      url: process.env.NEXT_PUBLIC_APP_URL,
    });
  } else {
    navigator.clipboard.writeText(text);
    alert('Result copied to clipboard!');
  }
}

export function generateColors(count: number): string[] {
  const result: string[] = [];

  for (let i = 0; i < count; i++) {
    const hue = Math.floor((360 / count) * i);
    result.push(`hsl(${hue}, 100%, 60%)`);
  }

  return result;
}

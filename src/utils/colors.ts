import * as vscode from "vscode";

export function generateColors(count: number): string[] {
  const colors: string[] = [];

  const isDark =
    vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;

  for (let i = 0; i < count; i++) {
    // Golden angle distribution
    const hue = (i * 137.508) % 360;

    // Smooth saturation variation
    const satBase = isDark ? 70 : 60;
    const saturation =
      satBase + Math.sin(i * 0.25) * 10 + Math.cos(i * 0.13) * 5;

    // Advanced lightness curve
    const lightBase = isDark ? 55 : 50;
    const lightness =
      lightBase + Math.sin(i * 0.4) * 12 + Math.cos(i * 0.18) * 6;

    colors.push(
      `hsl(${hue}, ${clamp(saturation, 40, 90)}%, ${clamp(
        lightness,
        isDark ? 45 : 35,
        isDark ? 75 : 70,
      )}%)`,
    );
  }

  return colors;
}

// keep values safe
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

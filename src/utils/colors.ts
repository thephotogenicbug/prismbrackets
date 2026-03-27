import * as vscode from "vscode";

export function generateColors(count: number): string[] {
  const result: string[] = [];

  // Detect VS Code theme
  const isDark =
    vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;

  for (let i = 0; i < count; i++) {
    const hue = (i * 137.508) % 360;

    // Dynamic saturation
    const saturation = isDark
      ? 75 + (i % 3) * 10 // 75–95% (bright for dark theme)
      : 60 + (i % 3) * 10; // 60–80% (softer for light theme)

    // Dynamic lightness
    const lightness = isDark
      ? 60 + (i % 4) * 6 // brighter
      : 40 + (i % 4) * 6; // darker

    result.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return result;
}

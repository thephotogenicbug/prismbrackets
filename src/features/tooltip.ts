import * as vscode from "vscode";

export function registerTooltip(context: vscode.ExtensionContext) {
  const provider: vscode.HoverProvider = {
    provideHover(document, position) {
      const text = document.getText();
      const offset = document.offsetAt(position);
      const char = text[offset];

      const pairs: Record<string, string> = {
        "(": ")",
        "{": "}",
        "[": "]",
      };

      const reverse: Record<string, string> = {
        ")": "(",
        "}": "{",
        "]": "[",
      };

      const types: Record<string, string> = {
        "(": "Round Bracket ( )",
        "{": "Curly Brace { }",
        "[": "Square Bracket [ ]",
        ")": "Round Bracket ( )",
        "}": "Curly Brace { }",
        "]": "Square Bracket [ ]",
      };

      if (!pairs[char] && !reverse[char]) return;

      let matchIndex: number | null = null;

      if (pairs[char]) {
        matchIndex = findMatchingForward(text, offset, char, pairs[char]);
      } else {
        matchIndex = findMatchingBackward(text, offset, reverse[char], char);
      }

      let depth = 0;
      let stack: string[] = [];

      for (let i = 0; i <= offset; i++) {
        const c = text[i];

        if (pairs[c]) {
          stack.push(c);
          depth++;
        } else if (reverse[c]) {
          if (stack.length && stack[stack.length - 1] === reverse[c]) {
            stack.pop();
            depth--;
          }
        }
      }

      const type = types[char];

      const scope =
        char === "{" || char === "}" ? detectScopeType(text, offset) : null;

      const md = new vscode.MarkdownString();
      md.isTrusted = true;

      if (matchIndex !== null) {
        const startLine = document.positionAt(offset).line + 1;
        const endLine = document.positionAt(matchIndex).line + 1;

        md.appendMarkdown(`**PrismBrackets**\n\n`);
        md.appendMarkdown(`Type: ${type}\n\n`);

        if (scope) {
          md.appendMarkdown(`Scope: ${scope}\n\n`);
        }

        md.appendMarkdown(`Depth: ${Math.max(depth, 0)}\n\n`);
        md.appendMarkdown(
          `Pair: Line ${Math.min(startLine, endLine)} → Line ${Math.max(startLine, endLine)}\n\n`,
        );
        md.appendMarkdown(`Status: Matched`);
      } else {
        const expected = pairs[char] || reverse[char];

        md.appendMarkdown(`**PrismBrackets Error**\n\n`);
        md.appendMarkdown(`Type: ${type}\n\n`);

        if (scope) {
          md.appendMarkdown(`Scope: ${scope}\n\n`);
        }

        md.appendMarkdown(`Expected: ${expected}\n\n`);
        md.appendMarkdown(`Status: Unmatched`);
      }

      return new vscode.Hover(md);
    },
  };

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      [
        "javascript",
        "typescript",
        "python",
        "java",
        "cpp",
        "php",
        "html",
        "json",
      ],
      provider,
    ),
  );
}

function findMatchingForward(
  text: string,
  start: number,
  open: string,
  close: string,
): number | null {
  let depth = 0;

  for (let i = start; i < text.length; i++) {
    if (text[i] === open) depth++;
    else if (text[i] === close) depth--;

    if (depth === 0) return i;
  }

  return null;
}

function findMatchingBackward(
  text: string,
  start: number,
  open: string,
  close: string,
): number | null {
  let depth = 0;

  for (let i = start; i >= 0; i--) {
    if (text[i] === close) depth++;
    else if (text[i] === open) depth--;

    if (depth === 0) return i;
  }

  return null;
}

function detectScopeType(text: string, index: number): string {
  const before = text.slice(Math.max(0, index - 80), index).toLowerCase();

  if (before.includes("function")) return "Function";
  if (before.includes("class")) return "Class";
  if (before.includes("if")) return "If Condition";
  if (before.includes("else")) return "Else Block";
  if (before.includes("for")) return "For Loop";
  if (before.includes("while")) return "While Loop";
  if (before.includes("switch")) return "Switch";
  if (before.includes("try")) return "Try Block";
  if (before.includes("catch")) return "Catch Block";

  return "Block";
}

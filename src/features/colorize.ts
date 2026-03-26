import * as vscode from "vscode";
import { isEnabled } from "../state";
import { decorationTypes } from "../decorations/decorations";

export function colorizeBrackets(editor: vscode.TextEditor, colors: string[]) {
  if (!isEnabled) return;

  const doc = editor.document;
  const text = doc.getText();

  const decorations: vscode.DecorationOptions[][] = colors.map(() => []);

  let stack: string[] = [];
  const depthMap: number[] = [];

  const pairs: Record<string, string> = {
    "(": ")",
    "{": "}",
    "[": "]",
  };

  let inString = false;
  let stringChar = "";
  let inSL = false;
  let inML = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];

    if (!inString && !inML && c === "/" && n === "/") {
      inSL = true;
      i++;
      continue;
    }
    if (!inString && !inSL && c === "/" && n === "*") {
      inML = true;
      i++;
      continue;
    }
    if (inSL && c === "\n") {
      inSL = false;
      continue;
    }
    if (inML && c === "*" && n === "/") {
      inML = false;
      i++;
      continue;
    }
    if (inSL || inML) continue;

    if (!inString && ['"', "'", "`"].includes(c)) {
      inString = true;
      stringChar = c;
      continue;
    }
    if (inString && c === stringChar) {
      inString = false;
      continue;
    }
    if (inString) continue;

    if ("({[".includes(c)) {
      stack.push(c);
      depthMap[i] = stack.length - 1;
    } else if (")}]".includes(c)) {
      const last = stack[stack.length - 1];
      if (last && pairs[last] === c) {
        depthMap[i] = stack.length - 1;
        stack.pop();
      } else {
        depthMap[i] = 0;
      }
    }
  }

  for (const range of editor.visibleRanges) {
    const start = doc.offsetAt(range.start);
    const end = doc.offsetAt(range.end);

    for (let i = start; i < end; i++) {
      const c = text[i];

      if ("(){}[]".includes(c)) {
        const depth = (depthMap[i] ?? 0) % colors.length;

        decorations[depth].push({
          range: new vscode.Range(
            doc.positionAt(i),
            doc.positionAt(Math.min(i + 1, text.length)),
          ),
        });
      }
    }
  }

  decorationTypes.forEach((d, i) => {
    editor.setDecorations(d, decorations[i]);
  });
}

import * as vscode from "vscode";
import { isEnabled } from "../state";
import { decorationTypes } from "../decorations/decorations";
import { getLanguageConfig } from "../utils/languageConfig";

export function colorizeBrackets(editor: vscode.TextEditor, colors: string[]) {
  if (!isEnabled) return;

  const doc = editor.document;

  if (["plaintext", "markdown", "log"].includes(doc.languageId)) return;

  const text = doc.getText();
  const lang = getLanguageConfig(doc.languageId);

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
  let mlEnd = "";

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    // --- Single line comment ---
    if (!inString && !inML && lang.singleLineComments) {
      for (const sl of lang.singleLineComments) {
        if (text.startsWith(sl, i)) {
          inSL = true;
          i += sl.length - 1;
          continue;
        }
      }
    }

    // --- Multi-line comment start ---
    if (!inString && !inSL && lang.multiLineComments) {
      for (const [start, end] of lang.multiLineComments) {
        if (text.startsWith(start, i)) {
          inML = true;
          mlEnd = end;
          i += start.length - 1;
          continue;
        }
      }
    }

    // --- End single-line ---
    if (inSL && c === "\n") {
      inSL = false;
      continue;
    }

    // --- End multi-line ---
    if (inML && text.startsWith(mlEnd, i)) {
      inML = false;
      i += mlEnd.length - 1;
      continue;
    }

    if (inSL || inML) continue;

    // --- Strings ---
    if (!inString && lang.stringDelimiters.includes(c)) {
      inString = true;
      stringChar = c;
      continue;
    }

    if (inString && c === stringChar) {
      inString = false;
      continue;
    }

    if (inString) continue;

    // --- Brackets ---
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

  // Apply only to visible ranges
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

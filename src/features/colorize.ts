import * as vscode from "vscode";
import { isEnabled } from "../state";
import { decorationTypes } from "../decorations/decorations";
import { buildIgnoreMap } from "../utils/parser";

export function colorizeBrackets(editor: vscode.TextEditor, colors: string[]) {
  if (!isEnabled) {
    return;
  }

  const doc = editor.document;

  if (["plaintext", "markdown", "log"].includes(doc.languageId)) {
    return;
  }

  const visible = editor.visibleRanges[0];
  if (!visible) {
    return;
  }

  const text = doc.getText(visible);
  const baseOffset = doc.offsetAt(visible.start);

  const { ignore } = buildIgnoreMap(text, doc.languageId);

  const decorations: vscode.DecorationOptions[][] = colors.map(() => []);

  const stack: string[] = [];
  const depthMap: number[] = [];

  const pairs: Record<string, string> = {
    "(": ")",
    "{": "}",
    "[": "]",
  };

  for (let i = 0; i < text.length; i++) {
    if (ignore[i]) {
      continue;
    }

    const c = text[i];

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

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (ignore[i]) {
      continue;
    }
    if (!"(){}[]".includes(c)) {
      continue;
    }

    const depth = (depthMap[i] ?? 0) % colors.length;

    decorations[depth].push({
      range: new vscode.Range(
        doc.positionAt(baseOffset + i),
        doc.positionAt(baseOffset + i + 1),
      ),
    });
  }

  decorationTypes.forEach((d, i) => {
    editor.setDecorations(d, decorations[i]);
  });
}

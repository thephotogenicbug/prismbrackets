import * as vscode from "vscode";
import { isEnabled } from "../state";
import { decorationTypes } from "../decorations/decorations";
import { getIgnoreMap } from "../utils/parserCache";

export function colorizeBrackets(editor: vscode.TextEditor, colors: string[]) {
  if (!isEnabled) {
    return;
  }

  const doc = editor.document;

  if (["plaintext", "markdown", "log"].includes(doc.languageId)) {
    return;
  }

  // FULL TEXT for correct depth calculation
  const fullText = doc.getText();
  const { ignore } = getIgnoreMap(fullText, doc.languageId);

  const stack: string[] = [];
  const depthMap: number[] = [];

  const pairs: Record<string, string> = {
    "(": ")",
    "{": "}",
    "[": "]",
  };

  // compute depth for entire document
  for (let i = 0; i < fullText.length; i++) {
    if (ignore[i]) {
      continue;
    }

    const c = fullText[i];

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

  // only render visible range
  const visible = editor.visibleRanges[0];
  if (!visible) {
    return;
  }

  const start = doc.offsetAt(visible.start);
  const end = doc.offsetAt(visible.end);

  const decorations: vscode.DecorationOptions[][] = colors.map(() => []);

  for (let i = start; i < end; i++) {
    if (ignore[i]) {
      continue;
    }

    const c = fullText[i];
    if (!"(){}[]".includes(c)) {
      continue;
    }

    const depth = (depthMap[i] ?? 0) % colors.length;

    decorations[depth].push({
      range: new vscode.Range(doc.positionAt(i), doc.positionAt(i + 1)),
    });
  }

  decorationTypes.forEach((d, i) => {
    editor.setDecorations(d, decorations[i]);
  });
}

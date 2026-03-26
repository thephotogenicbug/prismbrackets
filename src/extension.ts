import * as vscode from "vscode";

let isEnabled = true;
let glowEnabled = true;

// debounce
let timeout: ReturnType<typeof setTimeout> | undefined;

function triggerUpdate(editor: vscode.TextEditor) {
  if (!editor) return;

  if (timeout) clearTimeout(timeout);

  timeout = setTimeout(() => {
    colorizeBrackets(editor);
  }, 80);
}

// clear decoration
function clearAllDecorations(editor: vscode.TextEditor) {
  decorationTypes.forEach((d) => editor.setDecorations(d, []));
  editor.setDecorations(matchDecoration, []);
}

// dynamic colors
function generateColors(count: number): string[] {
  const result: string[] = [];

  for (let i = 0; i < count; i++) {
    const hue = Math.floor((360 / count) * i);
    result.push(`hsl(${hue}, 100%, 60%)`);
  }

  return result;
}

const colors = generateColors(24);

// dynamic decorations
let decorationTypes: vscode.TextEditorDecorationType[] = [];

function createDecorations() {
  decorationTypes.forEach((d) => d.dispose());

  decorationTypes = colors.map((color) =>
    vscode.window.createTextEditorDecorationType({
      color,
      fontWeight: "bold",
      textDecoration: glowEnabled ? "0 0 8px currentColor" : "none",
    }),
  );
}

// match decoration
const matchDecoration = vscode.window.createTextEditorDecorationType({
  border: "1px solid currentColor",
  textDecoration: "0 0 12px currentColor",
  fontWeight: "bold",
});

export function activate(context: vscode.ExtensionContext) {
  createDecorations();

  if (!context.globalState.get("prismbrackets.welcomeShown")) {
    vscode.window.showInformationMessage("PrismBrackets activated ✨");
    context.globalState.update("prismbrackets.welcomeShown", true);
  }

  // 🔥 STATUS BAR
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );

  function updateStatusBar() {
    statusBar.text = isEnabled ? "🌈 PrismBrackets" : "⚫ PrismBrackets OFF";

    statusBar.tooltip = isEnabled
      ? "Click to disable PrismBrackets"
      : "Click to enable PrismBrackets";

    statusBar.command = "prismbrackets.toggleEnable";
  }

  updateStatusBar();
  statusBar.show();

  context.subscriptions.push(statusBar, matchDecoration);

  const editor = vscode.window.activeTextEditor;
  if (editor) triggerUpdate(editor);

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) triggerUpdate(editor);
  });

  vscode.workspace.onDidChangeTextDocument((event) => {
    if (!event.contentChanges.length) return;

    const editor = vscode.window.activeTextEditor;
    if (editor && event.document === editor.document) {
      triggerUpdate(editor);
    }
  });

  vscode.window.onDidChangeTextEditorSelection((event) => {
    highlightMatchingBracket(event.textEditor);
  });

  // Toggle Glow 
  const toggleGlow = vscode.commands.registerCommand(
    "prismbrackets.toggleGlow",
    () => {
      glowEnabled = !glowEnabled;

      createDecorations();

      const editor = vscode.window.activeTextEditor;

      if (editor) {
        clearAllDecorations(editor); // 🔥 FIX
        triggerUpdate(editor); // 🔥 FIX
      }

      vscode.window.showInformationMessage(
        `PrismBrackets Glow ${glowEnabled ? "Enabled ✨" : "Disabled"}`,
      );
    },
  );

  // Toggle Enable 
  const toggleEnable = vscode.commands.registerCommand(
    "prismbrackets.toggleEnable",
    () => {
      isEnabled = !isEnabled;

      const editor = vscode.window.activeTextEditor;

      if (editor) {
        clearAllDecorations(editor); // 🔥 FIX

        if (isEnabled) {
          triggerUpdate(editor); // 🔥 FIX
        }
      }

      updateStatusBar();

      vscode.window.showInformationMessage(
        `PrismBrackets ${isEnabled ? "Enabled 🌈" : "Disabled"}`,
      );
    },
  );

  context.subscriptions.push(toggleGlow, toggleEnable);
}

// main logic
function colorizeBrackets(editor: vscode.TextEditor) {
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

    // comments
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

    // strings
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

    // brackets
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
        const safeEnd = Math.min(i + 1, text.length);

        decorations[depth].push({
          range: new vscode.Range(doc.positionAt(i), doc.positionAt(safeEnd)),
        });
      }
    }
  }

  decorationTypes.forEach((d, i) => {
    editor.setDecorations(d, decorations[i]);
  });
}

// matching brackets
function highlightMatchingBracket(editor: vscode.TextEditor) {
  const doc = editor.document;
  const text = doc.getText();

  let index = doc.offsetAt(editor.selection.active);
  let char = text[index];

  if (!"(){}[]".includes(char) && index > 0) {
    index--;
    char = text[index];
  }

  const pairs: Record<string, string> = {
    "(": ")",
    "{": "}",
    "[": "]",
    ")": "(",
    "}": "{",
    "]": "[",
  };

  if (!pairs[char]) {
    editor.setDecorations(matchDecoration, []);
    return;
  }

  const isOpen = "({[".includes(char);
  const match = pairs[char];

  let stack = 0;

  if (isOpen) {
    for (let i = index + 1; i < text.length; i++) {
      if (text[i] === char) stack++;
      else if (text[i] === match) {
        if (stack === 0) return applyMatch(editor, index, i);
        stack--;
      }
    }
  } else {
    for (let i = index - 1; i >= 0; i--) {
      if (text[i] === char) stack++;
      else if (text[i] === match) {
        if (stack === 0) return applyMatch(editor, i, index);
        stack--;
      }
    }
  }

  editor.setDecorations(matchDecoration, []);
}

function applyMatch(editor: vscode.TextEditor, s: number, e: number) {
  const doc = editor.document;

  editor.setDecorations(matchDecoration, [
    { range: new vscode.Range(doc.positionAt(s), doc.positionAt(s + 1)) },
    { range: new vscode.Range(doc.positionAt(e), doc.positionAt(e + 1)) },
  ]);
}

export function deactivate() {}

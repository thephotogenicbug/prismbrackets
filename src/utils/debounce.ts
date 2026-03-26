let timeout: ReturnType<typeof setTimeout> | undefined;

export function triggerUpdate(editor: any, fn: Function) {
  if (!editor) return;

  if (timeout) clearTimeout(timeout);

  timeout = setTimeout(() => {
    fn(editor);
  }, 80);
}

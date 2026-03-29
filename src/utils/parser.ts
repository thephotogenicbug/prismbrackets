import { getLanguageConfig } from "./languageConfig";

export type ParseState = {
  ignore: boolean[];
};

export function buildIgnoreMap(text: string, langId: string): ParseState {
  const lang = getLanguageConfig(langId);

  const ignore = new Array(text.length).fill(false);

  let inString = false;
  let stringChar = "";

  let inSL = false;
  let inML = false;
  let mlEnd = "";

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    // single-line comment
    if (!inString && !inML && lang.singleLineComments) {
      for (const sl of lang.singleLineComments) {
        if (text.startsWith(sl, i)) {
          inSL = true;
          mark(ignore, i, sl.length);
          i += sl.length - 1;
          continue;
        }
      }
    }

    // multi-line comment start
    if (!inString && !inSL && lang.multiLineComments) {
      for (const [start, end] of lang.multiLineComments) {
        if (text.startsWith(start, i)) {
          inML = true;
          mlEnd = end;
          mark(ignore, i, start.length);
          i += start.length - 1;
          continue;
        }
      }
    }

    if (inSL) {
      ignore[i] = true;
      if (c === "\n") {
        inSL = false;
      }
      continue;
    }

    if (inML) {
      ignore[i] = true;
      if (text.startsWith(mlEnd, i)) {
        mark(ignore, i, mlEnd.length);
        i += mlEnd.length - 1;
        inML = false;
      }
      continue;
    }

    // strings
    if (!inString && lang.stringDelimiters.includes(c)) {
      inString = true;
      stringChar = c;
      ignore[i] = true;
      continue;
    }

    if (inString) {
      ignore[i] = true;
      if (c === stringChar) {
        inString = false;
      }
      continue;
    }
  }

  return { ignore };
}

function mark(arr: boolean[], start: number, len: number) {
  for (let i = 0; i < len; i++) {
    arr[start + i] = true;
  }
}

import { buildIgnoreMap } from "./parser";

let lastText = "";
let lastLang = "";
let lastResult: any = null;

export function getIgnoreMap(text: string, lang: string) {
  if (text === lastText && lang === lastLang) {
    return lastResult;
  }

  lastText = text;
  lastLang = lang;
  lastResult = buildIgnoreMap(text, lang);

  return lastResult;
}

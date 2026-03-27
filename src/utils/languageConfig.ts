export type LanguageConfig = {
  singleLineComments?: string[];
  multiLineComments?: [string, string][];
  stringDelimiters: string[];
};

export const languageConfigs: Record<string, LanguageConfig> = {
  // JS / TS
  javascript: {
    singleLineComments: ["//"],
    multiLineComments: [["/*", "*/"]],
    stringDelimiters: ['"', "'", "`"],
  },
  typescript: {
    singleLineComments: ["//"],
    multiLineComments: [["/*", "*/"]],
    stringDelimiters: ['"', "'", "`"],
  },

  // Python
  python: {
    singleLineComments: ["#"],
    multiLineComments: [
      ['"""', '"""'],
      ["'''", "'''"],
    ],
    stringDelimiters: ['"', "'"],
  },

  // HTML
  html: {
    multiLineComments: [["<!--", "-->"]],
    stringDelimiters: ['"', "'"],
  },

  // JSON
  json: {
    stringDelimiters: ['"'],
  },

  // SQL
  sql: {
    singleLineComments: ["--"],
    multiLineComments: [["/*", "*/"]],
    stringDelimiters: ["'", '"'],
  },

  // C
  c: {
    singleLineComments: ["//"],
    multiLineComments: [["/*", "*/"]],
    stringDelimiters: ['"', "'"],
  },

  // C++
  cpp: {
    singleLineComments: ["//"],
    multiLineComments: [["/*", "*/"]],
    stringDelimiters: ['"', "'"],
  },

  // Java
  java: {
    singleLineComments: ["//"],
    multiLineComments: [["/*", "*/"]],
    stringDelimiters: ['"', "'"],
  },

  // PHP
  php: {
    singleLineComments: ["//", "#"],
    multiLineComments: [["/*", "*/"]],
    stringDelimiters: ['"', "'"],
  },

  // --- Laravel Blade ---
  blade: {
    singleLineComments: ["//", "#"],
    multiLineComments: [
      ["<!--", "-->"],
      ["/*", "*/"],
    ],
    stringDelimiters: ['"', "'"],
  },
};

export function getLanguageConfig(langId: string): LanguageConfig {
  return (
    languageConfigs[langId] || {
      stringDelimiters: ['"', "'"],
    }
  );
}

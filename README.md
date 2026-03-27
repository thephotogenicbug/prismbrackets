<p align="center">
  <img src="./readme_logo.png" alt="PrismBrackets Logo" width="340"/>
</p>

<h1 align="center">🌈 Prism Brackets</h1>

<p align="center">
  Advanced rainbow bracket highlighting with glow, multi-language support, and smart parsing.
</p>

<p align="center">
  Improve readability • Reduce errors • Code faster
</p>

<p align="center">
  ✨ Clean code starts with clear brackets
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.2.0-blue" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
  <img src="https://img.shields.io/badge/VSCode-Extension-blue?logo=visualstudiocode" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" />
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=Naveendev.prismbrackets">
    <img src="https://img.shields.io/badge/Install%20on-VS%20Code-blue?style=for-the-badge&logo=visualstudiocode" />
  </a>

  <a href="https://marketplace.visualstudio.com/items?itemName=Naveendev.prismbrackets">
    <img src="https://img.shields.io/badge/View%20on-Marketplace-purple?style=for-the-badge&logo=visualstudiocode" />
  </a>
</p>

---

## 🚀 Overview

**PrismBrackets** enhances your coding experience with:

- 🌈 Depth-based rainbow bracket highlighting
- ✨ Glow effects for better visibility
- 🧠 Intelligent parsing (ignores strings/comments)
- ⚡ Real-time updates while typing

Designed for **clarity, performance, and developer productivity**.

---


## ✨ Features

- 🌈 Depth-based rainbow bracket highlighting
- 🎨 Advanced color system (less repetition, better spacing)
- 🌗 Theme-aware colors (auto adapts to dark/light themes)
- ✨ Glow effect for enhanced visibility
- 🎯 Matching bracket highlight
- ⚡ Real-time updates while typing
- 🔘 Enable/Disable toggle (status bar)
- 🧠 Smart parsing (ignores strings & comments)

### 🌍 Supported Languages

- JavaScript / TypeScript
- Python
- HTML / JSON
- SQL
- C / C++
- Java
- PHP / Laravel Blade (partial)

---

## 🖼️ Preview

### Main Showcase

<p align="center">
  <img src="./showcase.png" width="700"/>
</p>

### Nested Depth Highlight

<p align="center">
  <img src="./nested_level.png" width="700"/>
</p>

### Mixed Brackets

<p align="center">
  <img src="./mixed.png" width="700"/>
</p>

---

## 🧪 Example

```js
function example() {
  return 1 + 2 * (3 + 4 * (5 + 6));
}
```

## 📦 Installation

```bash
ext install Naveendev.prismbrackets
```

---

## 🤝 Contributing

```bash
git clone https://github.com/thephotogenicbug/prismbrackets.git
cd prismbrackets
npm install
npm run watch
```

## 🧠 Project Structure

```bash
src/
├── commands/
│   └── toggle.ts          # Enable/disable + glow toggle commands

├── decorations/
│   └── decorations.ts     # VS Code decoration creation & management

├── features/
│   ├── colorize.ts        # Core bracket coloring logic
│   └── match.ts           # Matching bracket highlight logic

├── utils/
│   ├── colors.ts          # Color generation (theme-aware)
│   ├── debounce.ts        # Performance optimization
│   └── languageConfig.ts  # Language-specific parsing rules

├── extension.ts           # Entry point (activation + listeners)
├── state.ts               # Global state (enabled, glow)

```

---

<p align="center"> Made with ❤️ by Naveen </p> ```

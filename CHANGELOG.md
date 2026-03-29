# Changelog

## [0.2.2] - 2026-03-29

### ✨ Added
- Scope border glow for active code block
- Vertical scope guide line for better structure visualization
- Theme-aware scope decorations (dark/light support)

### ⚡ Improvements
- Optimized decoration lifecycle (initialized once, updated on theme change)
- Added parser caching to avoid repeated ignore map computation
- Reduced unnecessary updates during cursor movement
- Improved rendering performance and smoothness

### 🧠 Enhancements
- More stable scope detection with reduced flickering
- Improved visual clarity for nested blocks
- Better consistency across different themes and languages

### 🐛 Fixes
- Fixed unnecessary decoration re-creation causing performance overhead
- Fixed vertical guide rendering compatibility (removed unsupported properties)
- Minor stability and performance fixes

---

## [0.2.1] - 2026-03-27

### ✨ Added
- Unmatched bracket detection (opening & closing)
- Error highlighting with red underline

### ⚡ Improvements
- Improved parsing accuracy
- Safer range handling to prevent crashes

### 🧠 Enhancements
- Ignore brackets inside:
  - Strings (`' " \``)
  - Single-line comments (`//`)
  - Multi-line comments (`/* */`)

---

## [0.2.0] - 2026-03-27

### ✨ Added
- Multi-language support:
  - JavaScript / TypeScript
  - Python
  - HTML / JSON
  - SQL
  - C / C++
  - Java
  - PHP / Laravel Blade (partial support)
- Theme-aware color system (dark/light mode support)
- Improved color generation using golden-angle algorithm
- Increased color depth (60 levels)

### ⚡ Improvements
- Better color distribution (reduced repetition)
- Optimized rendering using visible ranges
- Improved performance with debounce system
- Cleaner event handling and lifecycle management

### 🐛 Fixes
- Fixed color refresh issue on theme change
- Fixed stale color reference bug
- Fixed duplicate event listener issue
- Improved stability across different file types

---

## [0.1.0] - Initial Release

### ✨ Features
- 🌈 Dynamic rainbow bracket colors (HSL-based)
- ✨ Glow toggle support
- 🔘 Enable/Disable toggle (status bar + command)
- 🧠 Ignore brackets inside strings and comments
- ⚡ Performance improvements (debounce + visible range)

### 🐛 Fixes
- Fixed decoration refresh bug
- Fixed range safety issues
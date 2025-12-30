# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## MOST IMPORTANT EXECUTION INSTRUCTIONS
- All communication with users must be conducted in Japanese!!
- The documents created must be in Japanese!!
- Only the content of CLAUDE.md should be written in English !!

## Project Overview
Vanilla Markdown Editor - A browser-based Markdown editor built with pure JavaScript (no frameworks). Features real-time preview, file management via IndexedDB, auto-save, and export functionality.

## Build & Development Commands
```bash
npm run dev      # Start development server (Vite)
npm run build    # Production build
npm run lint     # Run ESLint
npm run format   # Run Prettier
```

## Architecture

### Module Structure (planned)
```
src/
├── app/bootstrap.js       # App initialization
├── ui/
│   ├── layout.js          # DOM references and rendering
│   └── bindings.js        # Event handling
├── services/
│   ├── editorService.js   # Input/cursor/shortcuts
│   ├── previewService.js  # Debounce + worker communication
│   ├── markdownService.js # Parse specification (delegated to worker)
│   ├── autosaveService.js # Auto-save scheduling
│   └── outlineService.js  # Heading extraction
├── repositories/
│   └── fileRepository.js  # IndexedDB CRUD operations
└── workers/
    └── markdown-worker.js # parse(text) => { html, outline }
```

### Key Design Patterns
- **Separation of concerns**: UI, persistence (IndexedDB), and parsing (Worker) are isolated
- **Worker-based parsing**: Markdown parsing runs in Web Worker to keep main thread responsive
- **Debounced updates**: Preview update (~100-250ms) and auto-save (~700-1200ms) use separate timers
- **RequestId pattern**: Worker responses include requestId to discard stale results

### Security Requirements (Critical)
- XSS prevention is mandatory - never allow raw HTML execution
- All output must be escaped before constructing safe HTML tags
- Reject `javascript:` scheme in URLs
- innerHTML usage limited to final safe HTML rendering only

### Data Model
```javascript
FileEntity {
  id: string,        // UUID
  title: string,     // e.g., "README.md"
  content: string,   // Markdown body
  createdAt: number, // epoch ms
  updatedAt: number,
  sortKey: number
}
```

## Development Workflow: Feature Development Process

When the user says: "continue implementing"

1) Check the contents of `docs/*.md`
2) Check the contents of `docs/progress.md`
3) Execute `.claude/commands/speckit.implement.md`
4) Update the progress to `docs/progress.md` and `specs/.../tasks.md`

## Sprint Reference
See `docs/sprint.md` for milestone definitions:
- M0: Setup (Vite, ESLint/Prettier, basic skeleton)
- S1: UI Layout (3-pane, responsive, dark mode)
- S2: Markdown Parser (regex subset, XSS protection)
- S3: File Management (IndexedDB, export)
- S4: Auto-save, debounce, shortcuts
- S5: Web Worker optimization
- S6: Clipboard, Outline, polish

## Active Technologies
- JavaScript (ES2020+) + なし（Vanilla JS、開発ツールはVite/ESLint/Prettierのみ） (002-markdown-parser)
- N/A（このスプリントでは永続化なし） (002-markdown-parser)
- IndexedDB（ブラウザ内永続化） (003-file-management)
- JavaScript (ES2020+), HTML, CSS + Vite（開発サーバー/ビルド）, ESLint, Prettier (005-web-worker-optimization)
- IndexedDB（既存fileRepository.js） (005-web-worker-optimization)

## Recent Changes
- 002-markdown-parser: Added JavaScript (ES2020+) + なし（Vanilla JS、開発ツールはVite/ESLint/Prettierのみ）

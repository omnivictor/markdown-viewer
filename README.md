# Markdown Viewer

A real-time markdown editor and viewer with GitHub Dark Default theme.

## Features

- **View / Edit Mode** - Toggle between view-only (full-width preview) and split editor+preview
- **Live Preview** - Instant rendering as you type
- **Dark / Light Mode** - GitHub Dark Default theme by default, with light mode toggle
- **Drag & Drop** - Drop `.md` files anywhere to open
- **File Management** - Open, create, and save files (Markdown or HTML export)
- **GitHub Flavored Markdown** - Tables, task lists, strikethrough, emoji
- **Syntax Highlighting** - Code blocks with language badges and copy button
- **Scroll Sync** - Editor and preview scroll together
- **Persistent Settings** - Theme, view mode saved to localStorage

## Tech Stack

- **Next.js 16** with App Router
- **React 19** + TypeScript
- **Tailwind CSS 4** + Typography plugin
- **Zustand** for state management
- **react-markdown** with remark/rehype plugins

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```text
src/
├── app/           # Next.js App Router (page, layout, globals.css)
├── components/    # React components (Header, Editor, Viewer, ThemeProvider)
├── store/         # Zustand store (theme, viewMode, file state)
├── types/         # TypeScript type definitions
└── lib/           # Utilities (DEFAULT_CONTENT, file validation, etc.)
```

## Usage

1. **Edit Mode** - Split pane: write markdown on the left, see preview on the right
2. **View Mode** - Full-width rendered preview (toggle via header button)
3. **Open File** - Click "Open" or drag & drop a `.md` / `.txt` file
4. **Save** - Export as Markdown (`.md`) or HTML (`.html`)
5. **Theme** - Toggle dark/light mode with the sun/moon button

## Supported Markdown Syntax

- Headings (H1-H6)
- Bold, italic, strikethrough
- Ordered and unordered lists
- Task lists (checkboxes)
- Code blocks with syntax highlighting
- Tables
- Blockquotes
- Links and images
- Emoji shortcodes
- Horizontal rules

## License

MIT

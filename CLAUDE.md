# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` Vite plugin — no `tailwind.config.js`)
- **Backend**: Spring Boot (separate service, not created yet)

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Type-check (tsc -b) then Vite production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

No test runner is configured yet.

## Architecture

This is a client-side SPA. The frontend communicates with a Spring Boot backend API.

- Entry: `index.html` → `src/main.tsx` → `src/App.tsx`
- Routing, state management, and HTTP client libraries are not yet installed
- Tailwind is imported with a single `@import "tailwindcss"` in `src/index.css`
- TypeScript strict mode is enabled (`noUnusedLocals`, `noUnusedParameters`)
- ESLint uses flat config (`eslint.config.js`) with React Hooks and TypeScript rules

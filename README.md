# DIFC Lex — Legal Precedent Navigator

Single-page React app for querying DIFC/ADGM legal PDFs via Gemini API. Upload court judgments, arbitration rulings, and regulatory circulars, then ask questions with cited answers. Everything session-only — no storage, no server.

## How it works

1. Enter your Gemini API key — app fetches available models from the API
2. Upload DIFC/ADGM legal PDFs — parsed client-side via pdfjs-dist
3. Ask questions — full document context sent to Gemini, answers returned with citations
4. Summarize any document with one click
5. Close tab — everything gone

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. No `.env` file needed — enter your API key in the app.

## Deploy

### Vercel

Connect this repo to Vercel — auto-detects Vite. No environment variables required.

```bash
npm install -g vercel
vercel
```

## Tech

- React 18 + Vite
- `@google/generative-ai` — Gemini SDK (browser-side)
- `pdfjs-dist` — client-side PDF text extraction
- No backend, no database, no storage

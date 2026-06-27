# DIFC Lex

Legal precedent navigator for DIFC and ADGM jurisdictions. Upload court judgments, arbitration rulings, and regulatory circulars as PDFs. Ask natural-language questions and get answers with specific citations and quoted passages — all client-side, nothing stored.

![DIFC Lex screenshot](src/img/Screenshot%202026-06-27%20191739.jpg)

## Quick start

1. Get a [Gemini API key](https://aistudio.google.com/apikey) (free tier works)
2. Open the app, enter your key, pick a model
3. Upload a legal PDF or load one of the built-in examples
4. Ask a question or click Summarize
5. Close the tab when done — everything disappears

## Finding legal documents

DIFC and ADGM publish judgments and rulings publicly. Here's where to look:

- **DIFC Courts judgments**: Search Google for `DIFC Court of First Instance judgment PDF` or `DIFC CFI [year] judgment`
- **ADGM Courts rulings**: Search for `ADGM Court judgment PDF` or `ADGM arbitration ruling`
- **DFSA enforcement notices**: Search for `DFSA enforcement action PDF` or `DFSA regulatory decision`
- **FSRA regulatory circulars**: Search for `FSRA regulatory circular ADGM PDF`
- **DIFC Employment Law cases**: Search for `DIFC employment judgment wrongful termination PDF`
- **General search tip**: Add `filetype:pdf` to any Google search to find only PDF documents (e.g. `DIFC judgment filetype:pdf`)

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. No `.env` file needed.

## Deploy to Vercel

Connect this repo to Vercel — auto-detects Vite. No environment variables required.

```bash
npm install -g vercel
vercel
```

## Privacy

Your API key and documents never leave your browser. No backend, no database, no tracking. Close the tab and everything is gone.

## Tech

- React 18 + Vite
- `@google/generative-ai` — Gemini SDK (browser-side)
- `pdfjs-dist` — client-side PDF text extraction and preview
- `marked` — markdown rendering for AI responses

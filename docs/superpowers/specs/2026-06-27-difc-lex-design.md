# DIFC Lex — Legal Precedent Navigator

## Overview

Single-page React app. User brings their own Gemini API key, uploads DIFC/ADGM legal PDFs, asks questions, gets answers with citations. Everything session-only, no persistence, no server.

## Architecture

Pure static React SPA deployed to Vercel. No API routes, no database, no storage.

```
React SPA (Vercel static)
├── ApiKeyInput — user enters key + model, held in React state
├── Uploader — drag/drop PDFs, pdfjs-dist extracts text client-side
├── DocList — uploaded documents, remove, summarize-per-doc
└── ChatPanel — Q&A, sends docs+question to Gemini, renders answer with citations
```

## User Flow

1. User enters Gemini API key + model name → React state (session only)
2. User uploads PDFs → pdfjs-dist extracts text → stored in React state
3. User types question → all doc texts + question sent to Gemini → answer with citations rendered
4. User can click "Summarize" on any document → Gemini summarizes
5. Close tab → everything gone

## Components

### App.jsx
- Top-level state: `apiKey`, `model`, `documents[]`, `messages[]`
- Tab/step layout: Key Entry → Upload → Chat
- If no API key set, show ApiKeyInput only

### ApiKeyInput.jsx
- Text input for API key (password field)
- Text input for model name (default: `gemini-2.5-flash`)
- "Connect" button sets state in App

### Uploader.jsx
- Drag & drop zone for PDFs
- Calls pdfParser on drop
- Shows parsing progress
- Adds `{name, text}` to documents[]

### DocList.jsx
- Lists uploaded documents with page/char count
- Remove button per doc
- "Summarize" button per doc → calls Gemini with summarization prompt

### ChatPanel.jsx
- Chat-style interface: question input + message history
- Each message: user question or assistant answer
- Answers include citations (source document name, relevant excerpt)
- Sends full document context with each query to Gemini

## Data Flow

```
ApiKeyInput → App (apiKey, model state)
Uploader → pdfParser → App (documents state)
ChatPanel → App → @google/generative-ai (apiKey + model + docs + question) → answer
```

## Gemini Prompt Design

### Query prompt
```
You are a legal research assistant specializing in DIFC and ADGM law.
Analyze the following legal documents and answer the user's question.
Cite specific documents and paragraphs in your answer.

Documents:
{doc texts with names}

Question: {user question}

Provide a clear answer with citations referencing the source documents.
```

### Summarize prompt
```
Summarize the following legal document. Include:
1. Court/tribunal name and case reference
2. Key legal issues
3. Holdings and reasoning
4. Notable precedents cited

Document: {doc text}
```

## Dependencies

- `react`, `react-dom` — UI
- `pdfjs-dist` — client-side PDF text extraction
- `@google/generative-ai` — Gemini SDK

## Files

```
DIFC_Lex/
├── package.json
├── index.html
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── components/
    │   ├── ApiKeyInput.jsx
    │   ├── Uploader.jsx
    │   ├── DocList.jsx
    │   └── ChatPanel.jsx
    └── utils/
        └── pdfParser.js
```

## Non-Goals

- No authentication, no user accounts
- No document persistence between sessions
- No chunking or vector search (full docs in context window)
- No multi-user support
- No mobile app

import { useState, useRef, useEffect } from 'react';
import ApiKeyInput from './components/ApiKeyInput';
import Uploader from './components/Uploader';
import DocList from './components/DocList';
import PdfViewer from './components/PdfViewer';
import ChatPanel from './components/ChatPanel';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [summarizing, setSummarizing] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [removedDoc, setRemovedDoc] = useState(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const undoTimer = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    return () => { if (undoTimer.current) clearTimeout(undoTimer.current); };
  }, []);

  const handleConnect = (key, modelName) => {
    setApiKey(key);
    setModel(modelName);
  };

  const handleUpload = (doc) => {
    setDocuments((prev) => {
      const next = [...prev, doc];
      if (next.length === 1) { setSelectedIndex(0); setShowHint(true); }
      return next;
    });
  };

  const handleSelect = (i) => {
    setSelectedIndex(i);
  };

  const handleRemove = (i) => {
    const doc = documents[i];
    setRemovedDoc({ doc, index: i });
    setDocuments((prev) => prev.filter((_, idx) => idx !== i));
    setSelectedIndex((prev) => {
      if (prev === null) return null;
      if (prev === i) return null;
      return prev > i ? prev - 1 : prev;
    });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setRemovedDoc(null), 6000);
  };

  const handleUndoRemove = () => {
    if (!removedDoc) return;
    setDocuments((prev) => {
      const next = [...prev];
      next.splice(removedDoc.index, 0, removedDoc.doc);
      return next;
    });
    setRemovedDoc(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  };

  const handleSummarize = (i) => {
    if (summarizing === i || !chatRef.current) return;
    setSummarizing(i);
    setShowHint(false);
    chatRef.current.summarizeDocument(documents[i]).finally(() => {
      setSummarizing(null);
    });
  };

  const handleDisconnect = () => {
    setApiKey('');
    setDocuments([]);
    setSelectedIndex(null);
    setShowDisconnectConfirm(false);
  };

  if (!apiKey) {
    return <ApiKeyInput onConnect={handleConnect} />;
  }

  const selectedDoc = selectedIndex !== null ? documents[selectedIndex] : null;

  return (
    <div className="app">
      <header>
        <h1>DIFC Lex</h1>
        <div className="header-info">
          <span>Model: {model}</span>
          <button className="btn-settings" onClick={() => setShowSettings(true)} aria-label="Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button className="btn-disconnect" onClick={() => setShowDisconnectConfirm(true)}>Disconnect</button>
        </div>
      </header>

      {removedDoc && (
        <div className="undo-bar" role="status">
          <span>Removed &ldquo;{removedDoc.doc.name}&rdquo;</span>
          <button onClick={handleUndoRemove}>Undo</button>
        </div>
      )}

      <main className="layout-3pane">
        <div className="pane pane-left">
          <Uploader onUpload={handleUpload} />
          <DocList
            documents={documents}
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
            onRemove={handleRemove}
            onSummarize={handleSummarize}
            summarizing={summarizing}
          />
        </div>

        <div className="pane pane-center">
          <PdfViewer
            blobUrl={selectedDoc?.blobUrl}
            fileName={selectedDoc?.name}
            text={selectedDoc?.text}
          />
        </div>

        <div className="pane pane-right">
          {showHint && (
            <div className="hint-bar">
              <span>Document ready. Select it in the list to preview, then ask a question or click Summarize.</span>
              <button onClick={() => setShowHint(false)} aria-label="Dismiss hint">&times;</button>
            </div>
          )}
          <ChatPanel ref={chatRef} apiKey={apiKey} model={model} documents={documents} onFirstMessage={() => setShowHint(false)} />
        </div>
      </main>

      {showSettings && (
        <SettingsModal
          apiKey={apiKey}
          model={model}
          onModelChange={setModel}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showDisconnectConfirm && (
        <div className="modal-overlay" onClick={() => setShowDisconnectConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-label="Confirm disconnect">
            <h2>Disconnect?</h2>
            <p>This will clear your API key and all uploaded documents. This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDisconnectConfirm(false)}>Cancel</button>
              <button onClick={handleDisconnect}>Disconnect</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

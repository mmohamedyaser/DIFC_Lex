import { useState } from 'react';
import { marked } from 'marked';
import ApiKeyInput from './components/ApiKeyInput';
import Uploader from './components/Uploader';
import DocList from './components/DocList';
import PdfViewer from './components/PdfViewer';
import ChatPanel from './components/ChatPanel';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [summarizing, setSummarizing] = useState(null);
  const [summaries, setSummaries] = useState({});

  const handleConnect = (key, modelName) => {
    setApiKey(key);
    setModel(modelName);
  };

  const handleUpload = (doc) => {
    setDocuments((prev) => {
      const next = [...prev, doc];
      if (next.length === 1) setSelectedIndex(0);
      return next;
    });
  };

  const handleSelect = (i) => {
    setSelectedIndex(i);
  };

  const handleRemove = (i) => {
    setDocuments((prev) => prev.filter((_, idx) => idx !== i));
    setSummaries((prev) => {
      const next = { ...prev };
      delete next[i];
      return next;
    });
    setSelectedIndex((prev) => {
      if (prev === null) return null;
      if (prev === i) return null;
      return prev > i ? prev - 1 : prev;
    });
  };

  const handleSummarize = async (i) => {
    if (summarizing === i) return;
    setSummarizing(i);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({ model });

      const prompt = `Summarize the following legal document. Include:
1. Court/tribunal name and case reference (if available)
2. Key legal issues
3. Holdings and reasoning
4. Notable precedents cited

Document: ${documents[i].text}`;

      const result = await geminiModel.generateContent(prompt);
      setSummaries((prev) => ({ ...prev, [i]: result.response.text() }));
    } catch (err) {
      setSummaries((prev) => ({ ...prev, [i]: `Error: ${err.message}` }));
    } finally {
      setSummarizing(null);
    }
  };

  const handleDisconnect = () => {
    setApiKey('');
    setDocuments([]);
    setSummaries({});
    setSelectedIndex(null);
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
          <button className="btn-disconnect" onClick={handleDisconnect}>Disconnect</button>
        </div>
      </header>

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
          {Object.entries(summaries).map(([idx, text]) => (
            <div key={idx} className="summary-card">
              <h4>Summary: {documents[Number(idx)].name}</h4>
              <div className="summary-text markdown" dangerouslySetInnerHTML={{ __html: marked(text) }} />
            </div>
          ))}
        </div>

        <div className="pane pane-center">
          <PdfViewer
            blobUrl={selectedDoc?.blobUrl}
            fileName={selectedDoc?.name}
          />
        </div>

        <div className="pane pane-right">
          <ChatPanel apiKey={apiKey} model={model} documents={documents} />
        </div>
      </main>
    </div>
  );
}

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { marked } from 'marked';

function humanError(err) {
  const msg = err.message || '';
  if (msg.includes('403') || msg.includes('401') || msg.includes('API key')) return 'API key is invalid or expired. Check your key in Settings.';
  if (msg.includes('429')) return 'Rate limited by Gemini API. Wait a moment and try again.';
  if (msg.includes('500') || msg.includes('503')) return 'Gemini API is temporarily unavailable. Try again in a few seconds.';
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) return 'Network error. Check your connection and try again.';
  if (msg.includes('timeout') || msg.includes('Timeout')) return 'Request timed out. The documents may be too large — try with fewer documents.';
  return `Something went wrong: ${msg}`;
}

const ChatPanel = forwardRef(function ChatPanel({ apiKey, model, documents, onFirstMessage }, ref) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const chatRef = useRef();

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages, loading, error]);

  const buildContext = () =>
    documents.map((d) => `--- DOCUMENT: ${d.name} ---\n${d.text}`).join('\n\n');

  const sendMessage = async (questionOverride) => {
    const question = (questionOverride || input).trim();
    if (!question || loading) return;

    if (!questionOverride) setInput('');
    setError('');
    setLastQuestion(question);
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    if (onFirstMessage) onFirstMessage();
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({
        model,
        systemInstruction: `You are a legal research assistant specializing in DIFC (Dubai International Financial Centre) and ADGM (Abu Dhabi Global Market) law. Analyze the provided legal documents and answer the user's question. Cite specific documents and quote relevant passages. If the documents don't contain enough information to answer fully, say so. Format citations as: [Document: "filename"] followed by the relevant quote.

CRITICAL: Output ONLY your final answer. Do NOT include your reasoning process, internal notes, draft outlines, keywords, self-corrections, meta-commentary, or any text describing how you are constructing the response. Start directly with the answer.`,
      });

      const userContent = `DOCUMENTS:\n${buildContext()}\n\nUSER QUESTION: ${question}`;
      const result = await geminiModel.generateContent(userContent);
      const text = result.response.text();

      setMessages((prev) => [...prev, { role: 'assistant', text }]);
    } catch (err) {
      setError(humanError(err));
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    summarizeDocument: async (doc) => {
      if (loading) return;
      setError('');
      setMessages((prev) => [...prev, { role: 'user', text: `Summarize: ${doc.name}` }]);
      if (onFirstMessage) onFirstMessage();
      setLoading(true);

      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const geminiModel = genAI.getGenerativeModel({
          model,
          systemInstruction: `You are a legal research assistant. Summarize the provided legal document. Include: 1. Court/tribunal name and case reference (if available), 2. Key legal issues, 3. Holdings and reasoning, 4. Notable precedents cited. CRITICAL: Output ONLY the final summary. Do NOT include your reasoning process, internal notes, draft outlines, keywords, self-corrections, or meta-commentary.`,
        });

        const result = await geminiModel.generateContent(doc.text);
        setMessages((prev) => [...prev, { role: 'assistant', text: result.response.text() }]);
      } catch (err) {
        setError(humanError(err));
      } finally {
        setLoading(false);
      }
    },
  }), [apiKey, model, loading, onFirstMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-messages" ref={chatRef} role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 && (
          <p className="chat-placeholder">
            Ask a question about your uploaded legal documents.
            <br />
            Example: "How have DIFC courts interpreted the fiduciary duty of fund managers?"
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="message-label">{msg.role === 'user' ? 'You' : 'DIFC Lex'}</div>
            {msg.role === 'assistant' ? (
              <div className="message-text markdown" dangerouslySetInnerHTML={{ __html: marked(msg.text) }} />
            ) : (
              <div className="message-text">{msg.text}</div>
            )}
          </div>
        ))}
        {loading && <div className="message assistant loading-message"><div className="message-text">Analyzing documents&hellip;</div></div>}
      </div>
      {error && (
        <div className="chat-error" role="alert">
          <p>{error}</p>
          <button onClick={() => { setError(''); sendMessage(lastQuestion); }}>Retry</button>
        </div>
      )}
      <div className="chat-input-row">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={documents.length === 0 ? 'Upload documents to begin\u2026' : 'Ask a legal question\u2026'}
          rows={2}
          disabled={documents.length === 0}
          aria-label="Your question"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim() || documents.length === 0}
          aria-label="Send question"
        >
          Send
        </button>
      </div>
    </div>
  );
});

export default ChatPanel;

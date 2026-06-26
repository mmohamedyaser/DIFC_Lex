import { useState } from 'react';

const GEMINI_MODELS_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export default function ApiKeyInput({ onConnect }) {
  const [key, setKey] = useState('');
  const [models, setModels] = useState([]);
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetched, setFetched] = useState(false);

  const fetchModels = async (e) => {
    e.preventDefault();
    if (!key.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${GEMINI_MODELS_URL}?key=${key.trim()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      const available = (data.models || [])
        .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m) => m.name.replace('models/', ''))
        .sort();
      if (available.length === 0) throw new Error('No generateContent-capable models found for this key.');
      setModels(available);
      setModel(available.includes('gemini-2.5-flash') ? 'gemini-2.5-flash' : available[0]);
      setFetched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (e) => {
    e.preventDefault();
    if (key.trim() && model) onConnect(key.trim(), model);
  };

  return (
    <div className="api-key-panel">
      <h1>DIFC Lex</h1>
      <p className="subtitle">Legal Precedent Navigator — DIFC & ADGM</p>

      {!fetched ? (
        <form onSubmit={fetchModels}>
          <label>Gemini API Key</label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            autoFocus
          />
          <button type="submit" disabled={!key.trim() || loading}>
            {loading ? 'Fetching models...' : 'Fetch Available Models'}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      ) : (
        <form onSubmit={handleConnect}>
          <label>Gemini API Key</label>
          <input type="password" value={key} disabled className="key-confirmed" />
          <label>Model</label>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button type="submit" disabled={!model}>Connect</button>
          <button type="button" className="btn-back" onClick={() => { setFetched(false); setModels([]); setError(''); }}>
            Use different key
          </button>
        </form>
      )}

      <p className="hint">Your key is held in memory only. Nothing is stored.</p>
    </div>
  );
}

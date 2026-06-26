import { useState } from 'react';

const GEMINI_MODELS_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export default function SettingsModal({ apiKey, model, onModelChange, onClose }) {
  const [newModel, setNewModel] = useState(model);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchModels = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${GEMINI_MODELS_URL}?key=${apiKey}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const available = (data.models || [])
        .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m) => m.name.replace('models/', ''))
        .sort();
      setModels(available);
      if (available.length === 0) setError('No compatible models found.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (newModel.trim()) onModelChange(newModel.trim());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>
        <form onSubmit={handleSave}>
          <label>Model</label>
          <input
            type="text"
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
            placeholder="Model name"
          />
          {models.length > 0 && (
            <select value={newModel} onChange={(e) => setNewModel(e.target.value)}>
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
          <div className="modal-actions">
            <button type="button" onClick={fetchModels} disabled={loading} className="btn-secondary">
              {loading ? 'Fetching...' : 'Fetch Available Models'}
            </button>
            <button type="submit" disabled={!newModel.trim()}>Save</button>
          </div>
          {error && <p className="error">{error}</p>}
        </form>
        <button className="modal-close" onClick={onClose}>&times;</button>
      </div>
    </div>
  );
}

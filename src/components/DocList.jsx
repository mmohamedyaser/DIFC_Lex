export default function DocList({ documents, onRemove, onSummarize, summarizing }) {
  if (documents.length === 0) return null;

  return (
    <div className="doc-list">
      <h3>Uploaded Documents ({documents.length})</h3>
      {documents.map((doc, i) => (
        <div key={i} className="doc-item">
          <div className="doc-info">
            <span className="doc-name">{doc.name}</span>
            <span className="doc-chars">{(doc.charCount / 1000).toFixed(1)}K chars</span>
          </div>
          <div className="doc-actions">
            <button
              onClick={() => onSummarize(i)}
              disabled={summarizing === i}
            >
              {summarizing === i ? 'Summarizing...' : 'Summarize'}
            </button>
            <button className="btn-remove" onClick={() => onRemove(i)}>Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
}

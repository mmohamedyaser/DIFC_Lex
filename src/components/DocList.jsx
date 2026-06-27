export default function DocList({ documents, selectedIndex, onSelect, onRemove, onSummarize, summarizing }) {
  if (documents.length === 0) return null;

  return (
    <div className="doc-list">
      <h3>Uploaded Documents ({documents.length})</h3>
      {documents.map((doc, i) => (
        <div
          key={i}
          className={`doc-item ${selectedIndex === i ? 'selected' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={`Select ${doc.name}`}
          aria-current={selectedIndex === i ? 'true' : undefined}
          onClick={() => onSelect(i)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(i); } }}
        >
          <div className="doc-info">
            <span className="doc-name">{doc.name}</span>
            <span className="doc-chars">{(doc.charCount / 1000).toFixed(1)}K chars</span>
          </div>
          <div className="doc-actions">
            <button
              onClick={(e) => { e.stopPropagation(); onSummarize(i); }}
              disabled={summarizing === i}
              aria-label={summarizing === i ? `Summarizing ${doc.name}` : `Summarize ${doc.name}`}
            >
              {summarizing === i ? 'Summarizing...' : 'Summarize'}
            </button>
            <button
              className="btn-remove"
              onClick={(e) => { e.stopPropagation(); onRemove(i); }}
              aria-label={`Remove ${doc.name}`}
            >Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
}

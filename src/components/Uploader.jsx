import { useState, useRef } from 'react';
import { extractText } from '../utils/pdfParser';
import EXAMPLES from '../data/examples';

export default function Uploader({ onUpload }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const processFiles = async (files) => {
    setError('');
    setLoading(true);
    for (const file of files) {
      if (file.type !== 'application/pdf') {
        setError(`"${file.name}" is not a PDF.`);
        continue;
      }
      try {
        const text = await extractText(file);
        const blobUrl = URL.createObjectURL(file);
        onUpload({ name: file.name, text, charCount: text.length, blobUrl });
      } catch (err) {
        setError(`Failed to parse "${file.name}": ${err.message}`);
      }
    }
    setLoading(false);
  };

  const loadExample = (example) => {
    onUpload({ name: example.name, text: example.text, charCount: example.text.length, blobUrl: null });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <div className="uploader-section">
      <div
        className={`drop-zone ${dragging ? 'dragging' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Upload PDF documents"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current.click(); } }}
      >
        {loading ? (
          <p>Parsing PDFs...</p>
        ) : (
          <p>Drop DIFC/ADGM PDF judgments here, or click to browse</p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => processFiles(e.target.files)}
      />
      {error && <p className="error">{error}</p>}

      <div className="examples-section">
        <p className="examples-label">No documents? Try an example case:</p>
        <div className="examples-buttons">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              className="btn-example"
              onClick={() => loadExample(ex)}
              aria-label={`Load example: ${ex.name}`}
            >
              {ex.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

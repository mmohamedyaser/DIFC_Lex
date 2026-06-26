import { useState, useRef } from 'react';
import { extractText } from '../utils/pdfParser';

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
        onUpload({ name: file.name, text, charCount: text.length });
      } catch (err) {
        setError(`Failed to parse "${file.name}": ${err.message}`);
      }
    }
    setLoading(false);
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
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
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
    </div>
  );
}

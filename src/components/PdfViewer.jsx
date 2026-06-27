import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function PdfViewer({ blobUrl, fileName }) {
  const [pages, setPages] = useState([]);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scale, setScale] = useState(1.3);
  const containerRef = useRef();

  useEffect(() => {
    if (!blobUrl) return;
    setLoading(true);
    setError('');
    setPages([]);

    const loadPdf = async () => {
      try {
        const res = await fetch(blobUrl);
        const buffer = await res.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        setNumPages(pdf.numPages);

        const pageCanvases = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          pageCanvases.push({ page, viewport, pageNum: i });
        }
        setPages(pageCanvases);
      } catch (err) {
        setError(`Failed to load PDF: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [blobUrl, scale]);

  useEffect(() => {
    if (pages.length === 0) return;
    const canvases = containerRef.current.querySelectorAll('canvas');
    pages.forEach(({ page, viewport }, i) => {
      const canvas = canvases[i];
      if (!canvas || canvas.dataset.rendered) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.dataset.rendered = '1';
      page.render({ canvasContext: canvas.getContext('2d'), viewport });
    });
  }, [pages]);

  if (!blobUrl) {
    return (
      <div className="pdf-viewer">
        <div className="pdf-placeholder">
          <p className="pdf-placeholder-title">{fileName ? 'Text-only document' : 'No document selected'}</p>
          <p className="pdf-placeholder-hint">
            {fileName
              ? 'This is a text-based example. Upload a PDF to see the original document with full formatting.'
              : 'Upload a PDF from the left panel, then click it here to preview'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-toolbar">
        <span className="pdf-filename">{fileName}</span>
        <div className="pdf-controls">
          <button onClick={() => setScale((s) => Math.max(0.5, s - 0.2))} disabled={scale <= 0.5}>-</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale((s) => Math.min(3, s + 0.2))} disabled={scale >= 3}>+</button>
        </div>
      </div>
      <div className="pdf-pages" ref={containerRef}>
        {loading && <p className="pdf-loading">Loading PDF...</p>}
        {error && <p className="error">{error}</p>}
        {pages.map(({ pageNum, viewport }) => (
          <div key={pageNum} className="pdf-page">
            <canvas style={{ width: viewport.width, height: viewport.height }} />
            <span className="pdf-page-num">{pageNum} / {numPages}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

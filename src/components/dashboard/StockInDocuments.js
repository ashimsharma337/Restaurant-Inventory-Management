import { useCallback, useEffect, useState } from 'react';
import styles from '@/styles/dashboard/StockInDocuments.module.scss';

const formatBytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export default function StockInDocuments() {
  const [reference, setReference] = useState('DELIVERY-001');
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const loadDocuments = useCallback(async (documentReference) => {
    if (!documentReference.trim()) return;
    const response = await fetch(`/api/documents?stockInReference=${encodeURIComponent(documentReference.trim())}`);
    const data = await response.json();
    if (response.ok) setDocuments(data.documents);
  }, []);

  useEffect(() => {
    loadDocuments(reference);
  }, [loadDocuments, reference]);

  const upload = async (event) => {
    event.preventDefault();
    if (!file || !reference.trim()) return setMessage('Choose a file and enter a stock-in reference.');
    setBusy(true);
    setMessage('');
    try {
      const presignResponse = await fetch('/api/documents/presign', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockInReference: reference.trim(), fileName: file.name, contentType: file.type, fileSize: file.size }),
      });
      const presign = await presignResponse.json();
      if (!presignResponse.ok) throw new Error(presign.error);
      const uploadResponse = await fetch(presign.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!uploadResponse.ok) throw new Error('S3 upload failed');
      const completeResponse = await fetch('/api/documents/complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockInReference: reference.trim(), originalName: file.name, objectKey: presign.objectKey, contentType: file.type, fileSize: file.size }),
      });
      const complete = await completeResponse.json();
      if (!completeResponse.ok) throw new Error(complete.error);
      setFile(null);
      event.target.reset();
      setMessage('Document uploaded.');
      await loadDocuments(reference);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}><div><p className={styles.eyebrow}>Stock In / Documentation</p><h1>Delivery documents</h1><p>Keep invoices and delivery receipts with the inventory receipt they support.</p></div></header>
      <section className={styles.panel}>
        <label className={styles.label} htmlFor="stock-in-reference">Stock-in reference</label>
        <input id="stock-in-reference" className={styles.input} value={reference} onChange={(event) => setReference(event.target.value)} onBlur={() => loadDocuments(reference)} placeholder="e.g. DELIVERY-001" />
        <form className={styles.uploadRow} onSubmit={upload}>
          <label className={styles.filePicker}><span className="material-symbols-outlined">upload_file</span><span>{file ? file.name : 'Choose invoice or receipt'}</span><input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => setFile(event.target.files[0] || null)} /></label>
          <button className={styles.button} disabled={busy || !file} type="submit"><span className="material-symbols-outlined">cloud_upload</span>{busy ? 'Uploading...' : 'Upload document'}</button>
        </form>
        <p className={styles.hint}>PDF, JPG, or PNG. Maximum 10 MB.</p>
        {message && <p className={styles.message} role="status">{message}</p>}
      </section>
      <section className={styles.panel}>
        <div className={styles.sectionHeading}><h2>Attached documents</h2><span>{documents.length}</span></div>
        {documents.length === 0 ? <p className={styles.empty}>No documents attached to this stock-in reference.</p> : <ul className={styles.list}>{documents.map((document) => <li className={styles.item} key={document.id}><span className="material-symbols-outlined">description</span><div><strong>{document.original_name}</strong><small>{formatBytes(document.file_size)}</small></div><a className={styles.download} href={`/api/documents/${document.id}/download`}><span className="material-symbols-outlined">download</span><span className={styles.downloadText}>Download</span></a></li>)}</ul>}
      </section>
    </main>
  );
}
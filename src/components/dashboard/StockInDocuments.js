import { useCallback, useEffect, useState } from "react";
import Button from "@/components/shared/Button";
import styles from "@/styles/dashboard/StockInDocuments.module.scss";

const formatBytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export default function StockInDocuments() {
  const [reference, setReference] = useState("DELIVERY-001");
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState([]);
  const [ocrByObjectKey, setOcrByObjectKey] = useState({});
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  const loadDocuments = useCallback(async () => {
    setLoadingDocuments(true);
    try {
      const response = await fetch("/api/documents");
      const data = await response.json();
      if (response.ok) setDocuments(data.documents);
    } finally {
      setLoadingDocuments(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (documents.length === 0) {
      setOcrByObjectKey({});
      return;
    }

    let cancelled = false;
    let timeout;

    const loadOcr = async () => {
      const results = await Promise.all(
        documents.map(async (document) => {
          const encodedKey = document.object_key
            .split("/")
            .map(encodeURIComponent)
            .join("/");
          try {
            const response = await fetch(`/api/documents/ocr/${encodedKey}`);
            const data = await response.json();
            if (response.ok) return [document.object_key, data];
            if (response.status === 404 && data.status === "pending") {
              return [document.object_key, { status: "pending" }];
            }
          } catch (error) {
            console.error("Could not load OCR data:", error);
          }
          return [document.object_key, { status: "unavailable" }];
        }),
      );

      if (cancelled) return;
      setOcrByObjectKey(Object.fromEntries(results));
      if (
        results.some(
          ([, result]) =>
            result.status !== "processed" && result.status !== "failed",
        )
      ) {
        timeout = setTimeout(loadOcr, 5000);
      }
    };

    loadOcr();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [documents]);

  const upload = async (event) => {
    event.preventDefault();
    if (!file || !reference.trim())
      return setMessage("Choose a file and enter a stock-in reference.");
    setBusy(true);
    setMessage("");
    try {
      const presignResponse = await fetch("/api/documents/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockInReference: reference.trim(),
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });
      const presign = await presignResponse.json();
      if (!presignResponse.ok) throw new Error(presign.error);
      const uploadResponse = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadResponse.ok) throw new Error("S3 upload failed");
      const completeResponse = await fetch("/api/documents/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockInReference: reference.trim(),
          originalName: file.name,
          objectKey: presign.objectKey,
          contentType: file.type,
          fileSize: file.size,
        }),
      });
      const complete = await completeResponse.json();
      if (!completeResponse.ok) throw new Error(complete.error);
      setFile(null);
      event.target.reset();
      setMessage("Document uploaded.");
      await loadDocuments();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const filteredDocuments = documents.filter((document) => {
    const ocr = ocrByObjectKey[document.object_key];
    const searchable = [
      document.original_name,
      document.stock_in_reference,
      ocr?.invoice_number,
      ocr?.po_reference,
      ocr?.total_due,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return searchable.includes(search.trim().toLowerCase());
  });

  const getOcrStatus = (ocr) => {
    if (!ocr || ocr.status === "pending") {
      return { label: "Processing", className: styles.statusPending };
    }
    if (ocr.status === "failed") {
      return { label: "Failed", className: styles.statusFailed };
    }
    if (ocr.status === "unavailable") {
      return { label: "Retrying", className: styles.statusPending };
    }
    return { label: "Processed", className: styles.statusProcessed };
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Stock In / Documentation</p>
          <h1>Delivery documents</h1>
          <p>
            Keep invoices and delivery receipts with the inventory receipt they
            support.
          </p>
        </div>
        <Button href="/dashboard" variant="secondary" icon="arrow_back">
          Back to dashboard
        </Button>
      </header>
      <section className={styles.panel}>
        <label className={styles.label} htmlFor="stock-in-reference">
          Stock-in reference for this upload
        </label>
        <input
          id="stock-in-reference"
          className={styles.input}
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="e.g. DELIVERY-001"
        />
        <form className={styles.uploadRow} onSubmit={upload}>
          <label className={styles.filePicker}>
            <span className="material-symbols-outlined">upload_file</span>
            <span>{file ? file.name : "Choose invoice or receipt"}</span>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              onChange={(event) => setFile(event.target.files[0] || null)}
            />
          </label>
          <button
            className={styles.button}
            disabled={busy || !file}
            type="submit"
          >
            <span className="material-symbols-outlined">cloud_upload</span>
            {busy ? "Uploading..." : "Upload document"}
          </button>
        </form>
        <p className={styles.hint}>PDF, JPG, or PNG. Maximum 10 MB.</p>
        {message && (
          <p className={styles.message} role="status">
            {message}
          </p>
        )}
      </section>
      <section className={`${styles.panel} ${styles.documentsPanel}`}>
        <div className={styles.sectionHeading}>
          <h2>Invoice register</h2>
          <span>{documents.length}</span>
        </div>
        <div className={styles.tableToolbar}>
          <label htmlFor="document-search">Search invoices</label>
          <input
            id="document-search"
            className={styles.input}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="File, reference, invoice, or PO"
          />
        </div>
        {loadingDocuments ? (
          <p className={styles.empty}>Loading uploaded documents...</p>
        ) : filteredDocuments.length === 0 ? (
          <p className={styles.empty}>
            {documents.length
              ? "No documents match this search."
              : "No documents have been uploaded yet."}
          </p>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.documentTable}>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Stock-in reference</th>
                  <th>Invoice</th>
                  <th>PO reference</th>
                  <th>Total due</th>
                  <th>OCR status</th>
                  <th>Uploaded</th>
                  <th>Processed at</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((document) => {
                  const ocr = ocrByObjectKey[document.object_key];
                  const status = getOcrStatus(ocr);
                  return (
                    <tr key={document.id}>
                      <td>
                        <strong>{document.original_name}</strong>
                        <small>{formatBytes(document.file_size)}</small>
                      </td>
                      <td>{document.stock_in_reference}</td>
                      <td>{ocr?.invoice_number || "—"}</td>
                      <td>{ocr?.po_reference || "—"}</td>
                      <td className={styles.amountCell}>
                        {ocr?.total_due || "—"}
                      </td>
                      <td>
                        <span className={`${styles.status} ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        {new Date(document.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        {ocr?.processed_at
                          ? new Date(ocr.processed_at).toLocaleString()
                          : "—"}
                      </td>
                      <td>
                        <a
                          className={styles.download}
                          href={`/api/documents/${document.id}/download`}
                          aria-label={`Download ${document.original_name}`}
                          title="Download document"
                        >
                          <span className="material-symbols-outlined">download</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

import { query } from "@/utility/db";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const reference = String(req.query.stockInReference || "").trim();
  if (!reference)
    return res.status(400).json({ error: "Stock-in reference is required" });

  try {
    const { rows } = await query(
      `SELECT id, stock_in_reference, original_name, content_type, file_size, created_at
       FROM stock_in_documents
       WHERE stock_in_reference = $1
       ORDER BY created_at DESC`,
      [reference],
    );
    return res.status(200).json({ documents: rows });
  } catch (error) {
    console.error("[/api/documents] error:", error);
    return res.status(500).json({ error: "Could not load documents" });
  }
}

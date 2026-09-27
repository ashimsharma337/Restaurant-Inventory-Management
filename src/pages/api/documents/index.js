import { query } from "@/utility/db";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const reference = String(req.query.stockInReference || "").trim();

  try {
    const { rows } = await query(
      `SELECT id, stock_in_reference, original_name, object_key, content_type, file_size, created_at
       FROM stock_in_documents
       WHERE ($1::text IS NULL OR stock_in_reference = $1)
       ORDER BY created_at DESC`,
      [reference || null],
    );
    return res.status(200).json({ documents: rows });
  } catch (error) {
    console.error("[/api/documents] error:", error);
    return res.status(500).json({ error: "Could not load documents" });
  }
}
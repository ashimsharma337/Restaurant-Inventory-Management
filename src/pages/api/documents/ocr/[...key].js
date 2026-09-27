import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" }),
);

const TABLE_NAME = process.env.DOCUMENTS_TABLE || "stock-in-documents";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const keyParts = req.query.key;
    const objectKey = Array.isArray(keyParts) ? keyParts.join("/") : keyParts;

    if (!objectKey) {
      return res.status(400).json({ error: "Missing object key" });
    }

    const result = await client.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { object_key: objectKey },
      }),
    );

    if (!result.Item) {
      return res.status(404).json({
        error: "OCR data not found",
        status: "pending", // still processing or failed
      });
    }

    const item = result.Item;

    return res.status(200).json({
      object_key: item.object_key,
      invoice_number: item.invoice_number || null,
      po_reference: item.po_reference || null,
      total_due: item.total_due || null,
      status: item.status || "processed",
      processed_at: item.processed_at || null,
    });
  } catch (err) {
    console.error("[/api/documents/ocr] error:", err);
    return res.status(500).json({ error: "Failed to fetch OCR data" });
  }
}

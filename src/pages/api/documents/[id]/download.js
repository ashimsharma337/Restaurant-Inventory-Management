import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3, { DOCUMENT_BUCKET } from '@/lib/s3';
import { query } from '@/utility/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { rows } = await query('SELECT object_key, original_name FROM stock_in_documents WHERE id = $1', [req.query.id]);
    if (!rows[0] || !DOCUMENT_BUCKET) return res.status(404).json({ error: 'Document not found' });

    const downloadUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: DOCUMENT_BUCKET, Key: rows[0].object_key, ResponseContentDisposition: `attachment; filename="${rows[0].original_name.replace(/[^a-zA-Z0-9._ -]/g, '_')}"` }),
      { expiresIn: 300 },
    );
    return res.redirect(307, downloadUrl);
  } catch (error) {
    console.error('[/api/documents/:id/download] error:', error);
    return res.status(500).json({ error: 'Could not create download link' });
  }
}
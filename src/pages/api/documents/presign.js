import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { s3ForBrowser, DOCUMENT_BUCKET } from '@/lib/s3';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { stockInReference, fileName, contentType, fileSize } = req.body || {};
  if (!DOCUMENT_BUCKET) return res.status(500).json({ error: 'S3 bucket is not configured' });
  if (!stockInReference || !fileName || !contentType || !Number.isInteger(fileSize)) {
    return res.status(400).json({ error: 'Stock-in reference and file details are required' });
  }
  if (!ALLOWED_TYPES.has(contentType) || fileSize < 1 || fileSize > MAX_FILE_SIZE) {
    return res.status(400).json({ error: 'Only PDF, JPG, and PNG files up to 10 MB are allowed' });
  }

  const extension = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : 'bin';
  const objectKey = `stock-in/${crypto.randomUUID()}.${extension}`;

  const uploadUrl = await getSignedUrl(
    s3ForBrowser,
    new PutObjectCommand({ Bucket: DOCUMENT_BUCKET, Key: objectKey, ContentType: contentType, ContentLength: fileSize }),
    { expiresIn: 900 },
  );

  return res.status(200).json({ uploadUrl, objectKey });
}
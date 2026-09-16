import { S3Client } from "@aws-sdk/client-s3";

const useLocalStack = process.env.NODE_ENV === "development";
const internalEndpoint = useLocalStack ? process.env.S3_ENDPOINT : undefined;
const publicEndpoint = useLocalStack
  ? process.env.S3_PUBLIC_ENDPOINT || internalEndpoint
  : undefined;

const clientOptions = (endpoint) => ({
  region: process.env.AWS_REGION || "us-east-1",
  ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
});

const s3 = new S3Client(clientOptions(internalEndpoint));

export const s3ForBrowser = new S3Client(clientOptions(publicEndpoint));

export const DOCUMENT_BUCKET = process.env.S3_BUCKET_NAME;

export default s3;

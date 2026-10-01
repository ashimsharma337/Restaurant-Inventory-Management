import {
  GetCallerIdentityCommand,
  STSClient,
} from "@aws-sdk/client-sts";

const isLocalStack =
  process.env.NODE_ENV === "development" && Boolean(process.env.S3_ENDPOINT);
const region = process.env.AWS_REGION || "us-east-1";
const sts = new STSClient({
  region,
  ...(isLocalStack ? { endpoint: process.env.S3_ENDPOINT } : {}),
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await sts.send(new GetCallerIdentityCommand({}));
    return res.status(200).json({
      status: "connected",
      environment: isLocalStack ? "LocalStack" : "AWS",
      region,
    });
  } catch (error) {
    console.error("[/api/aws/identity] STS check failed:", error?.name);
    return res.status(503).json({
      status: "disconnected",
      error: "Unable to verify credentials or reach STS.",
    });
  }
}
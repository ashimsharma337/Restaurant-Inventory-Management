# AWS STS Connection Check

The Help page includes a **Check AWS connection** action. It calls the server-side
`GET /api/aws/identity` endpoint, which uses `GetCallerIdentity` from
`@aws-sdk/client-sts` to verify that the configured credentials can reach STS.

The response reports only the connection status, environment, and region. It does
not return the AWS account ID or ARN, since this endpoint does not require app
authentication.

## Environment Selection

- In development, when `S3_ENDPOINT` is set, the STS client uses that endpoint
  and reports **LocalStack**. The local credentials in `.env.localstack.example`
  are used by the SDK's normal credential provider chain.
- Otherwise, the STS client uses AWS endpoints and reports **AWS**. For laptop
  testing, select the configured profile when starting Next.js, for example:

  ```bash
  AWS_PROFILE=restaurant-inventory npm run dev
  ```

- The region is `AWS_REGION`, falling back to `us-east-1`.

`GetCallerIdentity` does not require an explicit IAM permission grant. Credentials
must still be configured and the selected STS endpoint must be reachable.

## Verify The API

Start the application in the desired environment and request the endpoint:

```bash
curl -i http://localhost:3000/api/aws/identity
```

A successful response looks like:

```json
{
  "status": "connected",
  "environment": "LocalStack",
  "region": "us-east-1"
}
```

The endpoint accepts `GET` only. Credential or connectivity failures return
HTTP `503`; unsupported methods return HTTP `405`.
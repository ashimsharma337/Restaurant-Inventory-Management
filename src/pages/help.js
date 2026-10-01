import { useState } from "react";

export default function Help() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);

  async function checkAwsConnection() {
    setChecking(true);
    setResult(null);

    try {
      const response = await fetch("/api/aws/identity");
      const data = await response.json();
      setResult(data);
    } catch {
      setResult({
        status: "disconnected",
        error: "Could not reach the connection check endpoint.",
      });
    } finally {
      setChecking(false);
    }
  }

  return (
    <main style={{ maxWidth: "48rem", padding: "2rem" }}>
      <h1>Help</h1>
      <section aria-labelledby="aws-connection-heading">
        <h2 id="aws-connection-heading">AWS connection</h2>
        <p>Check that the configured AWS or LocalStack credentials can reach STS.</p>
        <button
          type="button"
          onClick={checkAwsConnection}
          disabled={checking}
          style={{ padding: "0.5rem 0.75rem" }}
        >
          {checking ? "Checking..." : "Check AWS connection"}
        </button>
        {result && (
          <p role="status" aria-live="polite">
            {result.status === "connected"
              ? `Connected to ${result.environment} in ${result.region}.`
              : result.error || "Could not verify the AWS connection."}
          </p>
        )}
      </section>
    </main>
  );
}

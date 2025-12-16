"use client";

import { trpc } from "@/trpc/client";
import { useState } from "react";

export default function TestPage() {
  const [owner, setOwner] = useState("facebook");
  const [repo, setRepo] = useState("react");

  const { data, isLoading, error, refetch } = trpc.github.getBasicInfo.useQuery(
    { owner, repo },
    { enabled: false }
  );

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1>Backend API Test</h1>
      <p>Test the simplified GitHub API endpoint</p>

      <div style={{ marginTop: "30px", marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Owner:
          </label>
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="facebook"
            style={{
              padding: "10px",
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "16px",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Repo:
          </label>
          <input
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="react"
            style={{
              padding: "10px",
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "16px",
            }}
          />
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoading}
          style={{
            padding: "12px 24px",
            background: "#0066ff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? "Loading..." : "Test API"}
        </button>
      </div>

      {isLoading && (
        <div
          style={{
            padding: "20px",
            background: "#f0f0f0",
            borderRadius: "4px",
          }}
        >
          <p>⏳ Fetching data from GitHub...</p>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "20px",
            background: "#fee",
            borderRadius: "4px",
            color: "#c00",
          }}
        >
          <strong>Error:</strong>
          <pre>{error.message}</pre>
        </div>
      )}

      {data && (
        <div
          style={{
            padding: "20px",
            background: "#f8f9fa",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
          }}
        >
          <h2>Success!</h2>
          <div style={{ marginTop: "10px" }}>
            <p>
              <strong>Name:</strong> {data.name}
            </p>
            <p>
              <strong>Owner:</strong> {data.owner}
            </p>
            <p>
              <strong>Description:</strong>{" "}
              {data.description || "No description"}
            </p>
            <p>
              <strong>Stars:</strong> {data.stars?.toLocaleString()}
            </p>
            <p>
              <strong>Forks:</strong> {data.forks?.toLocaleString()}
            </p>
            <p>
              <strong>Language:</strong> {data.language || "N/A"}
            </p>
            <p>
              <strong>URL:</strong>{" "}
              <a href={data.url} target="_blank">
                {data.url}
              </a>
            </p>
          </div>

          <details style={{ marginTop: "20px" }}>
            <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
              Raw JSON
            </summary>
            <pre
              style={{
                background: "#f5f5f5",
                padding: "15px",
                borderRadius: "4px",
                overflow: "auto",
                fontSize: "12px",
              }}
            >
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

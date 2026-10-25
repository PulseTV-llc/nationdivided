"use client";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#08090d", color: "#f3f0ea", fontFamily: "system-ui, sans-serif" }}>
        <title>Something went wrong — Nation Divided</title>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
          <div>
            <p style={{ letterSpacing: "0.2em", fontSize: 12, color: "#c9a56a", textTransform: "uppercase" }}>Nation Divided</p>
            <h1 style={{ fontSize: 48, margin: "16px 0" }}>Something went wrong.</h1>
            <button
              type="button"
              onClick={() => retry()}
              style={{ background: "#f3f0ea", color: "#08090d", border: 0, borderRadius: 999, padding: "14px 28px", cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}

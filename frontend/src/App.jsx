// frontend/src/App.jsx
import { useState } from "react";

export default function App() {
  const [file, setFile] = useState(null);
  const [width, setWidth] = useState(100);
  const [ascii, setAscii] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConvert(e) {
    e?.preventDefault();
    if (!file) {
      alert("Choose an image first.");
      return;
    }
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("width", String(width));
    try {
      const res = await fetch("http://localhost:8000/convert", {
        // OR '/api/convert' if you proxy
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      const data = await res.json();
      setAscii(data.ascii || "");
    } catch (err) {
      console.error(err);
      alert("Conversion failed: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    if (!ascii) return;
    navigator.clipboard.writeText(ascii).then(
      () => alert("Copied to clipboard"),
      () => alert("Copy failed — try selecting and copying manually")
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1>Image → ASCII</h1>

      <div style={{ marginBottom: 16 }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <label>Width (cols):</label>
        <input
          type="range"
          min="20"
          max="300"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          style={{ width: 200 }}
        />
        <input
          type="number"
          min="10"
          max="800"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          style={{ width: 80 }}
        />
        <button onClick={handleConvert} disabled={loading}>
          {loading ? "Converting…" : "Convert"}
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <button onClick={copyToClipboard} disabled={!ascii}>
          Copy ASCII
        </button>
        <button
          onClick={() => {
            const blob = new Blob([ascii], {
              type: "text/plain;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "ascii.txt";
            a.click();
            URL.revokeObjectURL(url);
          }}
          disabled={!ascii}
          style={{ marginLeft: 8 }}
        >
          Download .txt
        </button>
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          padding: 12,
          height: 480,
          overflow: "auto",
          background: "#111",
        }}
      >
        <pre
          style={{
            fontFamily: "Courier, 'Courier New', monospace",
            whiteSpace: "pre",
            color: "#eee",
            margin: 0,
            fontSize: 8, // tweak to taste
            lineHeight: "8px", // keep characters square-ish
          }}
        >
          {ascii || (loading ? "Converting…" : "Your ASCII will appear here.")}
        </pre>
      </div>
    </div>
  );
}

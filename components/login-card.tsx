"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginCard() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode })
    });

    setLoading(false);
    if (!res.ok) {
      setError("Invalid passcode");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>US Trip Dashboard</h1>
      <p className="muted">Enter shared passcode to continue</p>
      <form onSubmit={submit} className="stack">
        <input
          className="input"
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Passcode"
          required
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Checking..." : "Enter"}
        </button>
        {error ? <p style={{ color: "#dc2626", margin: 0 }}>{error}</p> : null}
      </form>
    </section>
  );
}

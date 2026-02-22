"use client";

import { useEffect, useMemo, useState } from "react";
import type { EntryType, Family, TripEntry } from "@/lib/types/trip";

const families: Array<Family | "ALL"> = ["ALL", "HO", "LAI", "OOI"];
const types: Array<EntryType | "ALL"> = ["ALL", "FLIGHT", "HOTEL", "ACTIVITY", "OTHER"];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
}

export default function DashboardClient() {
  const [entries, setEntries] = useState<TripEntry[]>([]);
  const [family, setFamily] = useState<Family | "ALL">("ALL");
  const [type, setType] = useState<EntryType | "ALL">("ALL");
  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (family !== "ALL") params.set("family", family);
    if (type !== "ALL") params.set("type", type);
    const res = await fetch(`/api/entries?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [family, type]);

  const grouped = useMemo(() => {
    return entries.reduce<Record<string, TripEntry[]>>((acc, item) => {
      const key = item.startDate.slice(0, 10);
      acc[key] = acc[key] ?? [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [entries]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  async function remove(id: string) {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`/api/entries?id=${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: "8px 0" }}>Trip Dashboard</h1>
        <button className="button secondary" style={{ width: "auto", padding: "10px 12px" }} onClick={logout}>Logout</button>
      </div>

      <section className="card stack">
        <strong>Family</strong>
        <div className="chip-tabs">
          {families.map((f) => (
            <button key={f} className={`chip ${family === f ? "active" : ""}`} onClick={() => setFamily(f)}>{f}</button>
          ))}
        </div>
        <strong>Type</strong>
        <div className="chip-tabs">
          {types.map((t) => (
            <button key={t} className={`chip ${type === t ? "active" : ""}`} onClick={() => setType(t)}>{t}</button>
          ))}
        </div>
      </section>

      {loading ? <p className="muted">Loading...</p> : null}

      {Object.keys(grouped)
        .sort((a, b) => a.localeCompare(b))
        .map((day) => (
          <section key={day} className="date-group">
            <div className="date-heading">{fmtDate(day)}</div>
            <div className="stack">
              {grouped[day].map((entry) => (
                <article className="entry" key={entry.id}>
                  <div className="badges">
                    <span className="badge">{entry.family}</span>
                    <span className="badge">{entry.type}</span>
                  </div>
                  <h4>{entry.location}</h4>
                  <p className="muted" style={{ margin: "4px 0" }}>
                    {fmtDate(entry.startDate)} - {fmtDate(entry.endDate)}
                  </p>
                  <p style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{entry.notes}</p>
                  {entry.screenshot ? (
                    <a href={entry.screenshot} target="_blank" rel="noreferrer" className="muted">View screenshot</a>
                  ) : null}
                  <div style={{ marginTop: 10 }}>
                    <button className="button danger" style={{ width: "auto", padding: "8px 10px" }} onClick={() => remove(entry.id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

      {!entries.length && !loading ? (
        <section className="card"><p className="muted" style={{ margin: 0 }}>No entries yet. Tap + to add one.</p></section>
      ) : null}

      {openAdd ? <AddEntryModal onClose={() => setOpenAdd(false)} onSaved={() => { setOpenAdd(false); load(); }} /> : null}
      <button className="fab" onClick={() => setOpenAdd(true)} aria-label="Add entry">+</button>
    </main>
  );
}

function AddEntryModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [family, setFamily] = useState<Family>("HO");
  const [type, setType] = useState<EntryType>("FLIGHT");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    let screenshot: string | undefined;
    if (file) {
      const form = new FormData();
      form.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: form });
      if (!up.ok) {
        setSaving(false);
        setError("Upload failed");
        return;
      }
      const upJson = await up.json();
      screenshot = upJson.url;
    }

    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ family, type, startDate, endDate, location, notes, screenshot })
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save");
      return;
    }
    onSaved();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.4)", padding: 12, overflow: "auto" }}>
      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>Add Entry</h2>
        <form className="stack" onSubmit={save}>
          <select className="select" value={family} onChange={(e) => setFamily(e.target.value as Family)}>
            <option value="HO">HO</option><option value="LAI">LAI</option><option value="OOI">OOI</option>
          </select>
          <select className="select" value={type} onChange={(e) => setType(e.target.value as EntryType)}>
            <option value="FLIGHT">FLIGHT</option><option value="HOTEL">HOTEL</option><option value="ACTIVITY">ACTIVITY</option><option value="OTHER">OTHER</option>
          </select>
          <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          <input className="input" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
          <textarea className="textarea" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} required />
          <input className="input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {error ? <p style={{ color: "#dc2626", margin: 0 }}>{error}</p> : null}
          <div className="row">
            <button className="button secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

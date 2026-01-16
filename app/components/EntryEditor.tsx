"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDateDisplay } from "@/lib/date";

type JournalEntry = {
  id: string;
  date: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";

const AUTO_SAVE_DELAY_MS = 800;

export default function EntryEditor({ date }: { date: string }) {
  const [body, setBody] = useState("");
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastSavedBody = useRef<string>("");
  const draftKey = useMemo(() => `draft:${date}`, [date]);

  const loadEntry = useCallback(async () => {
    setError(null);
    setIsLoaded(false);
    setSaveState("idle");

    const draft = localStorage.getItem(draftKey);
    if (draft !== null) {
      setBody(draft);
      setIsDirty(true);
    } else {
      setBody("");
      setIsDirty(false);
    }

    try {
      const response = await fetch(`/api/entries/${date}`);
      const data = (await response.json()) as { entry: JournalEntry | null };
      setEntry(data.entry ?? null);

      if (draft === null) {
        const nextBody = data.entry?.body ?? "";
        setBody(nextBody);
        lastSavedBody.current = nextBody;
      } else if (data.entry?.body === draft) {
        localStorage.removeItem(draftKey);
        setIsDirty(false);
        lastSavedBody.current = draft;
      }
    } catch (fetchError) {
      setError("Failed to load entry. Your draft is safe locally.");
    } finally {
      setIsLoaded(true);
    }
  }, [date, draftKey]);

  useEffect(() => {
    loadEntry();
  }, [loadEntry]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    if (body === lastSavedBody.current) {
      setIsDirty(false);
      localStorage.removeItem(draftKey);
      return;
    }
    setIsDirty(true);
    localStorage.setItem(draftKey, body);
  }, [body, draftKey, isLoaded]);

  const persistEntry = useCallback(
    async (nextBody: string) => {
      setSaveState("saving");
      setError(null);
      try {
        const response = await fetch(`/api/entries/${date}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: nextBody }),
        });
        if (!response.ok) {
          throw new Error("Save failed");
        }
        const data = (await response.json()) as { entry: JournalEntry };
        setEntry(data.entry);
        lastSavedBody.current = nextBody;
        localStorage.removeItem(draftKey);
        setIsDirty(false);
        setSaveState("saved");
      } catch (saveError) {
        setSaveState("error");
        setError("Save failed. Please retry.");
      }
    },
    [date, draftKey],
  );

  useEffect(() => {
    if (!isLoaded || !isDirty) {
      return;
    }
    const timeout = setTimeout(() => {
      void persistEntry(body);
    }, AUTO_SAVE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [body, isDirty, isLoaded, persistEntry]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleSaveNow = () => {
    void persistEntry(body);
  };

  const saveIndicator = () => {
    if (saveState === "saving") return "Saving…";
    if (saveState === "saved") return "Saved";
    if (saveState === "error") return "Save failed";
    if (isDirty) return "Unsaved changes";
    return "All changes saved";
  };

  const hasEntry = Boolean(entry);
  const metadata = entry
    ? `Created ${new Date(entry.createdAt).toLocaleString()} · Updated ${new Date(
        entry.updatedAt,
      ).toLocaleString()}`
    : "No entry created yet.";

  return (
    <section className="entry-editor">
      <header className="entry-header">
        <div>
          <h2>{formatDateDisplay(date)}</h2>
          <p className="entry-meta">{metadata}</p>
        </div>
        <div className="entry-actions">
          <button type="button" onClick={handleSaveNow} disabled={!isDirty}>
            Save now
          </button>
          <span className={`save-indicator save-${saveState}`}>
            {saveIndicator()}
          </span>
        </div>
      </header>
      {!hasEntry && !body && (
        <div className="entry-empty">
          No entry for this date yet. Start typing to create one.
        </div>
      )}
      <textarea
        className="entry-textarea"
        placeholder="Write your journal entry here..."
        value={body}
        onChange={(event) => setBody(event.target.value)}
        aria-label={`Journal entry for ${date}`}
      />
      {error && <div className="entry-error">{error}</div>}
    </section>
  );
}

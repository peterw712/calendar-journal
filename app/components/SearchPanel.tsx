"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SearchResult = {
  date: string;
  snippet: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightSnippet(snippet: string, query: string) {
  if (!query) {
    return snippet;
  }
  const regex = new RegExp(`(${escapeRegExp(query)})`, "ig");
  const parts = snippet.split(regex);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark key={index}>{part}</mark>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

export default function SearchPanel() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [hasSearched, setHasSearched] = useState(false);
  const [entryCount, setEntryCount] = useState<number | null>(null);

  const trimmedQuery = query.trim();

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      if (!trimmedQuery) {
        setResults([]);
        setStatus("idle");
        setHasSearched(false);
        return;
      }
      setStatus("loading");
      setHasSearched(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { results: SearchResult[] };
        setResults(data.results ?? []);
      } catch (error) {
        if (!(error instanceof DOMException)) {
          setResults([]);
        }
      } finally {
        setStatus("idle");
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [trimmedQuery]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchCount = async () => {
      try {
        const response = await fetch("/api/entries/count", {
          signal: controller.signal,
        });
        const data = (await response.json()) as { count: number };
        setEntryCount(typeof data.count === "number" ? data.count : 0);
      } catch (error) {
        if (!(error instanceof DOMException)) {
          setEntryCount(null);
        }
      }
    };
    fetchCount();
    return () => controller.abort();
  }, []);

  const renderedResults = useMemo(() => {
    return results.map((result) => (
      <button
        key={result.date}
        className="search-result"
        type="button"
        onClick={() => router.push(`/day/${result.date}`)}
      >
        <div className="search-result-date">{result.date}</div>
        <div className="search-result-snippet">
          {highlightSnippet(result.snippet, trimmedQuery)}
        </div>
      </button>
    ));
  }, [results, router, trimmedQuery]);

  return (
    <section className="search-panel">
      <label className="search-label" htmlFor="search-input">
        Search all entries
      </label>
      <input
        id="search-input"
        className="search-input"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Type to search entries..."
      />
      {status === "loading" && <div className="search-status">Searching…</div>}
      {entryCount === 0 && !trimmedQuery && (
        <div className="search-empty">
          No entries yet. Start writing to build your journal.
        </div>
      )}
      {hasSearched && status === "idle" && results.length === 0 && (
        <div className="search-empty">No results found.</div>
      )}
      {renderedResults.length > 0 && (
        <div className="search-results">{renderedResults}</div>
      )}
    </section>
  );
}

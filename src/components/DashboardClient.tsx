"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef } from "react";
import type { Bookmark } from "@/types";

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return "";
  }
}

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export default function DashboardClient({
  userId,
  initialBookmarks,
}: {
  userId: string;
  initialBookmarks: Bookmark[];
}) {
  const supabase = createClient();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  // ── Real-time subscription for cross-tab sync ──
  useEffect(() => {
    const channel = supabase
      .channel(`bookmarks-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newBookmark = payload.new as Bookmark;
            if (newBookmark.user_id === userId) {
              setBookmarks((prev) => {
                if (prev.some((b) => b.id === newBookmark.id)) return prev;
                return [newBookmark, ...prev];
              });
            }
          }

          if (payload.eventType === "DELETE") {
            const oldRecord = payload.old as { id?: string };
            if (oldRecord.id) {
              setBookmarks((prev) => prev.filter((b) => b.id !== oldRecord.id));
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  // ── Add bookmark ──
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!url.trim() || !title.trim()) {
      setError("Both fields are required.");
      return;
    }

    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      setError("Please enter a valid URL.");
      return;
    }

    setAdding(true);
    const finalUrl = url.startsWith("http") ? url : `https://${url}`;

    const { data, error: insertError } = await supabase
      .from("bookmarks")
      .insert({
        user_id: userId,
        url: finalUrl,
        title: title.trim(),
      })
      .select()
      .single();

    setAdding(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (data) {
      setBookmarks((prev) => {
        if (prev.some((b) => b.id === data.id)) return prev;
        return [data as Bookmark, ...prev];
      });
    }

    setUrl("");
    setTitle("");
    setSuccessMessage("Bookmark added!");
    titleInputRef.current?.focus();
    setTimeout(() => setSuccessMessage(""), 2500);
  };

  // ── Delete bookmark ──
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));

    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (error) {
      console.error("Delete failed:", error.message);
      const { data } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (data) setBookmarks(data as Bookmark[]);
    }

    setDeletingId(null);
  };

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-gray-900 via-gray-900 to-gray-800 p-6 sm:p-8">
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Your Bookmarks</h2>
              <p className="text-sm text-gray-400">
                {bookmarks.length === 0
                  ? "Start saving your favorite links"
                  : `${bookmarks.length} bookmark${bookmarks.length === 1 ? "" : "s"} saved`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Form ── */}
      <form onSubmit={handleAdd}>
        <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60 backdrop-blur-sm">
          <div className="border-b border-gray-800 px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Add New Bookmark
            </p>
          </div>
          <div className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <input
                  ref={titleInputRef}
                  type="text"
                  placeholder="Bookmark title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-700/50 bg-gray-800/50 py-3 pl-10 pr-4 text-sm text-gray-100 placeholder-gray-500 outline-none transition-all duration-200 focus:border-blue-500/50 focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="relative flex-1">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-xl border border-gray-700/50 bg-gray-800/50 py-3 pl-10 pr-4 text-sm text-gray-100 placeholder-gray-500 outline-none transition-all duration-200 focus:border-blue-500/50 focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={adding}
                className="group relative overflow-hidden rounded-xl bg-linear-to-r from-blue-600 to-blue-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 hover:brightness-110 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer whitespace-nowrap active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {adding ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Bookmark
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Messages */}
            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 shrink-0 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            {successMessage && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 shrink-0 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-sm text-emerald-400">{successMessage}</p>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* ── Bookmark List ── */}
      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-700 bg-gray-900/30 py-16 px-4">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-400">
            No bookmarks yet
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Add your first bookmark using the form above
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookmarks.map((bookmark, index) => (
            <div
              key={bookmark.id}
              className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60 backdrop-blur-sm transition-all duration-200 hover:border-gray-700 hover:bg-gray-800/80 hover:shadow-lg hover:shadow-black/20"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
                {/* Favicon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-800 ring-1 ring-gray-700/50">
                  <img
                    src={getFaviconUrl(bookmark.url)}
                    alt=""
                    className="h-4 w-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center gap-1.5"
                  >
                    <span className="truncate text-sm font-medium text-gray-200 transition-colors group-hover/link:text-blue-400">
                      {bookmark.title}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 shrink-0 text-gray-600 transition-all group-hover/link:text-blue-400 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {bookmark.url}
                  </p>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                  <span className="hidden text-xs text-gray-600 sm:inline whitespace-nowrap">
                    {getRelativeTime(bookmark.created_at)}
                  </span>
                  <button
                    onClick={() => handleDelete(bookmark.id)}
                    disabled={deletingId === bookmark.id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-50 cursor-pointer"
                    title="Delete bookmark"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Subtle left accent line */}
              <div className="absolute left-0 top-0 h-full w-0.5 bg-linear-to-b from-blue-500/0 via-blue-500/0 to-blue-500/0 transition-all duration-300 group-hover:from-blue-500/50 group-hover:via-blue-500/30 group-hover:to-blue-500/0" />
            </div>
          ))}
        </div>
      )}

      {/* ── Footer Stats ── */}
      {bookmarks.length > 0 && (
        <div className="flex items-center justify-center gap-2 pt-2 text-xs text-gray-600">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/60 animate-pulse" />
          <span>Real-time sync active</span>
          <span className="text-gray-700">·</span>
          <span>
            {bookmarks.length} bookmark{bookmarks.length === 1 ? "" : "s"}
          </span>
        </div>
      )}
    </div>
  );
}

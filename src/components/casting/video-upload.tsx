"use client";

import { useEffect, useRef, useState } from "react";
import { Film, X, UploadCloud } from "lucide-react";
import { VIDEO_LIMITS } from "@/content/casting";

export type UploadedVideo = { key: string; contentType: string; size: number; fileName: string };

type State =
  | { kind: "idle" }
  | { kind: "uploading"; progress: number; name: string }
  | { kind: "done"; video: UploadedVideo; preview: string }
  | { kind: "error"; message: string };

const fmt = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`);

/**
 * Optional introduction video. Validates type and size in the browser,
 * asks the server for a short-lived signed URL, then uploads directly to
 * private storage with progress. The server re-checks everything.
 */
export function VideoUpload({
  value,
  onChange,
  error,
}: {
  value: UploadedVideo | null;
  onChange: (v: UploadedVideo | null) => void;
  error?: string;
}) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const xhr = useRef<XMLHttpRequest | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => xhr.current?.abort(), []);
  useEffect(() => {
    return () => {
      if (state.kind === "done") URL.revokeObjectURL(state.preview);
    };
  }, [state]);

  const start = async (file: File) => {
    const type = file.type || (file.name.toLowerCase().endsWith(".mov") ? "video/quicktime" : "");
    if (!VIDEO_LIMITS.types[type]) {
      setState({ kind: "error", message: `That file type isn't supported. Please use ${VIDEO_LIMITS.typesLabel}.` });
      return;
    }
    if (file.size > VIDEO_LIMITS.maxBytes) {
      setState({ kind: "error", message: `That video is ${fmt(file.size)}. The limit is ${VIDEO_LIMITS.maxLabel}.` });
      return;
    }
    setState({ kind: "uploading", progress: 0, name: file.name });
    try {
      const res = await fetch("/api/casting/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: type, size: file.size }),
      });
      const ticket = await res.json();
      if (!res.ok || !ticket.ok) throw new Error(ticket.error || "Upload unavailable.");

      await new Promise<void>((resolve, reject) => {
        const req = new XMLHttpRequest();
        xhr.current = req;
        req.open(ticket.method, ticket.url);
        Object.entries(ticket.headers as Record<string, string>).forEach(([k, v]) => req.setRequestHeader(k, v));
        req.upload.onprogress = (e) => {
          if (e.lengthComputable) setState({ kind: "uploading", progress: e.loaded / e.total, name: file.name });
        };
        req.onload = () => (req.status >= 200 && req.status < 300 ? resolve() : reject(new Error("The upload didn't complete.")));
        req.onerror = () => reject(new Error("Network error during upload."));
        req.onabort = () => reject(new Error("Upload cancelled."));
        req.send(file);
      });

      const video = { key: ticket.key as string, contentType: type, size: file.size, fileName: file.name.slice(0, 200) };
      setState({ kind: "done", video, preview: URL.createObjectURL(file) });
      onChange(video);
    } catch (e) {
      setState({ kind: "error", message: e instanceof Error ? e.message : "Upload failed." });
      onChange(null);
    } finally {
      xhr.current = null;
    }
  };

  const remove = () => {
    xhr.current?.abort();
    setState({ kind: "idle" });
    onChange(null);
    if (input.current) input.current.value = "";
  };

  const showDone = state.kind === "done" && value;

  return (
    <div>
      {!showDone && state.kind !== "uploading" && (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) void start(f);
          }}
          className={`group flex min-h-56 cursor-pointer flex-col items-center justify-center gap-4 border border-dashed px-6 py-10 text-center transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold ${
            dragging ? "border-gold bg-gold/5" : "border-line-strong hover:border-ash"
          }`}
        >
          <UploadCloud aria-hidden className="h-8 w-8 text-gold" strokeWidth={1.25} />
          <span className="text-ivory">
            Drop a video here, or <span className="underline underline-offset-4">choose a file</span>
          </span>
          <span className="text-sm text-ash">
            {VIDEO_LIMITS.typesLabel} · up to {VIDEO_LIMITS.maxLabel} · {VIDEO_LIMITS.suggestedLength} is plenty
          </span>
          <input
            ref={input}
            type="file"
            accept={Object.keys(VIDEO_LIMITS.types).join(",") + ",.mov,.mp4,.m4v,.webm"}
            className="sr-only"
            aria-describedby="video-status"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void start(f);
            }}
          />
        </label>
      )}

      {state.kind === "uploading" && (
        <div className="border border-line-strong p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="flex min-w-0 items-center gap-3 text-ivory">
              <Film aria-hidden className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.25} />
              <span className="truncate">{state.name}</span>
            </p>
            <button type="button" onClick={remove} className="label min-h-11 px-2 text-ash hover:text-ivory">
              Cancel
            </button>
          </div>
          <div
            className="mt-5 h-1 bg-line"
            role="progressbar"
            aria-label="Upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(state.progress * 100)}
          >
            <div className="h-full bg-gold transition-[width] duration-300" style={{ width: `${state.progress * 100}%` }} />
          </div>
          <p className="label mt-3 tabular-nums text-ash">{Math.round(state.progress * 100)}% uploaded</p>
        </div>
      )}

      {showDone && state.kind === "done" && (
        <div className="grid gap-5 border border-gold/50 p-4 sm:grid-cols-[14rem_1fr] sm:items-center">
          <video src={state.preview} controls preload="metadata" className="aspect-video w-full bg-ink" />
          <div className="flex flex-col gap-3">
            <p className="label text-gold">Uploaded securely</p>
            <p className="break-all text-ivory">{value.fileName}</p>
            <p className="text-sm text-ash">{fmt(value.size)} · Only the casting team can view this.</p>
            <button
              type="button"
              onClick={remove}
              className="label inline-flex min-h-11 w-fit items-center gap-2 text-ash hover:text-ivory"
            >
              <X aria-hidden className="h-4 w-4" /> Remove video
            </button>
          </div>
        </div>
      )}

      <p id="video-status" role="status" className="mt-3 min-h-[1.25rem] text-sm text-crimson-lit">
        {state.kind === "error" ? state.message : (error ?? "")}
      </p>
    </div>
  );
}

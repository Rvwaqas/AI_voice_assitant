"use strict";
"use client";

import React from "react";

interface ReplyCardProps {
  reply: string;
  isPlayingAudio: boolean;
  onReplayAudio?: () => void;
  hasAudio: boolean;
}

export const ReplyCard: React.FC<ReplyCardProps> = ({
  reply,
  isPlayingAudio,
  onReplayAudio,
  hasAudio,
}) => {
  if (!reply) return null;

  // Detect YouTube or HTTP links to render clickable links
  const renderFormattedText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline font-semibold transition-colors"
          >
            <span>Open Link</span>
            <svg
              className="w-4 h-4 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/90 to-indigo-950/40 p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {isPlayingAudio && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            )}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
          </span>
          Assistant Reply
        </span>

        {hasAudio && onReplayAudio && (
          <button
            type="button"
            onClick={onReplayAudio}
            title="Replay Audio"
            className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
          >
            <svg
              className={`w-3.5 h-3.5 ${isPlayingAudio ? "animate-pulse text-indigo-400" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.5 9.75H3v4.5h4.5l4.5 4.5z"
              />
            </svg>
            <span>{isPlayingAudio ? "Speaking..." : "Replay"}</span>
          </button>
        )}
      </div>

      <div className="text-base sm:text-lg text-slate-100 font-normal leading-relaxed whitespace-pre-line">
        {renderFormattedText(reply)}
      </div>
    </div>
  );
};

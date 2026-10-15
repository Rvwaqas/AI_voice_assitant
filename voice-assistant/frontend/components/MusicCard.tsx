"use strict";
"use client";

import React from "react";

interface MusicCardProps {
  musicUrl: string;
  isPopupBlocked?: boolean;
}

export const MusicCard: React.FC<MusicCardProps> = ({
  musicUrl,
  isPopupBlocked = false,
}) => {
  if (!musicUrl) return null;

  // Extract query from youtube url if available
  let queryText = "Requested Song";
  try {
    const urlObj = new URL(musicUrl);
    const q = urlObj.searchParams.get("search_query");
    if (q) {
      queryText = decodeURIComponent(q);
    }
  } catch {}

  const handleOpenSong = () => {
    window.open(musicUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full max-w-xl animate-fade-in rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-950/60 via-slate-900/90 to-black/80 p-4 sm:p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        {/* Left: YouTube Icon & Song Details */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-tr from-red-700 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            <svg
              className="w-6 h-6 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-800/60">
                YouTube Music
              </span>
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="w-1 h-4 bg-rose-400 rounded-full animate-pulse delay-75" />
                <span className="w-1 h-2 bg-red-600 rounded-full animate-pulse delay-150" />
              </div>
            </div>
            <p className="text-sm sm:text-base font-semibold text-white truncate mt-0.5">
              {queryText}
            </p>
          </div>
        </div>

        {/* Right: Direct Action Button */}
        <button
          type="button"
          onClick={handleOpenSong}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Open YouTube</span>
          <svg
            className="w-4 h-4"
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
        </button>
      </div>

      {/* Pop-up blocked helper banner */}
      {isPopupBlocked && (
        <div className="mt-3 pt-3 border-t border-red-900/60 flex items-start gap-2 text-xs text-amber-300 bg-amber-950/20 p-2.5 rounded-lg border border-amber-800/40">
          <svg className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <span>Browser ne voice popup block kiya. Song kholne ke liye upar <strong>&quot;Open YouTube&quot;</strong> dabayein, ya browser bar se <strong>&quot;Always allow pop-ups&quot;</strong> select karein.</span>
          </div>
        </div>
      )}
    </div>
  );
};

"use strict";
"use client";

import React from "react";

interface TranscriptCardProps {
  transcript: string;
  isListening: boolean;
}

export const TranscriptCard: React.FC<TranscriptCardProps> = ({
  transcript,
  isListening,
}) => {
  if (!transcript && !isListening) return null;

  return (
    <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {isListening && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            )}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          You Said
        </span>
        {isListening && (
          <span className="text-xs text-slate-400 animate-pulse">Capturing voice...</span>
        )}
      </div>

      <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
        {transcript ? (
          transcript
        ) : (
          <span className="italic text-slate-500">Listening to your voice...</span>
        )}
      </p>
    </div>
  );
};

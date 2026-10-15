"use strict";
"use client";

import React from "react";

interface MicButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const MicButton: React.FC<MicButtonProps> = ({
  isListening,
  isProcessing,
  onClick,
  disabled = false,
}) => {
  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Outer Glow Pulse Aura (Active when recording) */}
      {isListening && (
        <>
          <div className="absolute h-56 w-56 rounded-full bg-red-500/20 blur-2xl animate-ping pointer-events-none" />
          <div className="absolute h-44 w-44 rounded-full bg-red-600/30 blur-xl animate-pulse pointer-events-none" />
        </>
      )}

      {/* Alexa-style Glowing Ring Border */}
      <div
        className={`absolute rounded-full transition-all duration-500 ${
          isListening
            ? "h-40 w-40 animate-ring-pulse bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 p-1 shadow-[0_0_50px_rgba(239,68,68,0.6)]"
            : isProcessing
            ? "h-36 w-36 animate-spin bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 p-1 shadow-[0_0_40px_rgba(59,130,246,0.5)]"
            : "h-32 w-32 bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-indigo-500/30 p-[2px] shadow-[0_0_20px_rgba(59,130,246,0.15)]"
        }`}
      >
        <div className="h-full w-full rounded-full bg-slate-950/90 backdrop-blur-md" />
      </div>

      {/* Main Circular Button */}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isProcessing}
        aria-label={isListening ? "Stop listening" : "Start speaking"}
        className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full transition-all duration-300 shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/40 cursor-pointer ${
          isListening
            ? "bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 scale-105 text-white shadow-red-600/60"
            : isProcessing
            ? "bg-slate-900 text-cyan-400 cursor-wait border border-blue-500/40"
            : "bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white hover:scale-105 hover:shadow-cyan-500/40"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isProcessing ? (
          /* Thinking Spinner */
          <div className="flex flex-col items-center gap-1">
            <svg
              className="h-10 w-10 animate-spin text-cyan-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
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
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          </div>
        ) : isListening ? (
          /* Active Recording Audio Waveform Bars */
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-6 bg-white rounded-full animate-audio-bar" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-10 bg-white rounded-full animate-audio-bar" style={{ animationDelay: "200ms" }} />
            <span className="w-1.5 h-12 bg-white rounded-full animate-audio-bar" style={{ animationDelay: "400ms" }} />
            <span className="w-1.5 h-8 bg-white rounded-full animate-audio-bar" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-6 bg-white rounded-full animate-audio-bar" style={{ animationDelay: "50ms" }} />
          </div>
        ) : (
          /* Large Microphone Icon */
          <svg
            className="h-12 w-12 drop-shadow-md transition-transform hover:scale-110"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z"
            />
          </svg>
        )}
      </button>

      {/* Status Label with Glow Effect */}
      <div className="mt-5 text-center">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
            isListening
              ? "bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse"
              : isProcessing
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "bg-slate-900/80 text-slate-400 border border-slate-800"
          }`}
        >
          {isProcessing ? (
            <>
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              Processing...
            </>
          ) : isListening ? (
            <>
              <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
              Listening... Tap to send
            </>
          ) : (
            "Tap to Speak"
          )}
        </span>
      </div>
    </div>
  );
};

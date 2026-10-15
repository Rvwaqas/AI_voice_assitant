"use strict";
"use client";

import React, { useEffect, useRef } from "react";
import { MusicCard } from "@/components/MusicCard";

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  musicUrl?: string | null;
  audioBlobUrl?: string | null;
  timestamp: string;
}

interface ChatMessagesListProps {
  messages: ConversationMessage[];
  activeAudioId: string | null;
  isPlayingAudio: boolean;
  onPlayAudio: (id: string, audioUrl: string) => void;
  isProcessing: boolean;
  processingStatus: string;
  isListening: boolean;
  interimTranscript: string;
  isPopupBlocked: boolean;
}

export const ChatMessagesList: React.FC<ChatMessagesListProps> = ({
  messages,
  activeAudioId,
  isPlayingAudio,
  onPlayAudio,
  isProcessing,
  processingStatus,
  isListening,
  interimTranscript,
  isPopupBlocked,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new messages or processing state
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing, interimTranscript]);

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
              className="w-3.5 h-3.5 inline"
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
    <div className="w-full flex flex-col space-y-4">
      {messages.map((msg, index) => {
        const isUser = msg.role === "user";

        return (
          <div
            key={msg.id || index}
            className={`w-full flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            {isUser ? (
              /* User Message Bubble */
              <div className="max-w-[85%] sm:max-w-xl rounded-2xl rounded-tr-sm bg-gradient-to-r from-blue-600/30 to-cyan-600/20 border border-cyan-500/30 p-4 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    You
                  </span>
                  <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                </div>
                <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            ) : (
              /* Assistant Message Bubble */
              <div className="w-full max-w-[95%] sm:max-w-xl space-y-3">
                <div className="rounded-2xl rounded-tl-sm bg-slate-900/80 border border-indigo-500/30 p-4 sm:p-5 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        {activeAudioId === msg.id && isPlayingAudio && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                        )}
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                      </span>
                      Assistant
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                      {msg.audioBlobUrl && (
                        <button
                          type="button"
                          onClick={() => onPlayAudio(msg.id, msg.audioBlobUrl!)}
                          title="Play/Replay Voice Audio"
                          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700 active:scale-95"
                        >
                          <svg
                            className={`w-3.5 h-3.5 ${
                              activeAudioId === msg.id && isPlayingAudio
                                ? "animate-pulse text-indigo-400"
                                : ""
                            }`}
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
                          <span>
                            {activeAudioId === msg.id && isPlayingAudio
                              ? "Speaking..."
                              : "Voice"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-sm sm:text-base text-slate-100 font-normal leading-relaxed whitespace-pre-line">
                    {renderFormattedText(msg.content)}
                  </div>
                </div>

                {/* Attached Music Card if song tool was triggered */}
                {msg.musicUrl && (
                  <MusicCard
                    musicUrl={msg.musicUrl}
                    isPopupBlocked={index === messages.length - 1 && isPopupBlocked}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Live Interim Transcript when user is currently speaking */}
      {isListening && (
        <div className="w-full flex justify-end animate-fade-in">
          <div className="max-w-[85%] sm:max-w-xl rounded-2xl rounded-tr-sm bg-cyan-950/40 border border-cyan-500/40 p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                Listening...
              </span>
            </div>
            <p className="text-sm sm:text-base text-cyan-200/90 italic font-medium">
              {interimTranscript || "Speak now, I'm listening..."}
            </p>
          </div>
        </div>
      )}

      {/* Assistant Thinking / Generating Indicator */}
      {isProcessing && (
        <div className="w-full flex justify-start animate-fade-in">
          <div className="rounded-2xl rounded-tl-sm bg-slate-900/90 border border-cyan-500/30 p-4 flex items-center gap-3 text-cyan-400 text-xs sm:text-sm font-medium shadow-xl">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span>{processingStatus || "AI is thinking..."}</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} className="h-2" />
    </div>
  );
};

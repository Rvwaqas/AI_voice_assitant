"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MicButton } from "@/components/MicButton";
import {
  ChatMessagesList,
  ConversationMessage,
} from "@/components/ChatMessagesList";
import {
  sendChatMessage,
  fetchSpeechAudio,
  checkBackendHealth,
} from "@/lib/api";

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export default function Home() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isPopupBlocked, setIsPopupBlocked] = useState(false);
  const [language, setLanguage] = useState<"en-US" | "ur-PK">("en-US");
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const shouldAutoSubmitRef = useRef<boolean>(true);
  const messagesRef = useRef<ConversationMessage[]>([]);

  // Keep messagesRef updated for async callbacks
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Monitor backend health status
  useEffect(() => {
    let mounted = true;
    const verifyHealth = async () => {
      const isHealthy = await checkBackendHealth();
      if (mounted) setBackendOnline(isHealthy);
    };
    verifyHealth();
    const interval = setInterval(verifyHealth, 12000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const formatTimestamp = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Play audio helper
  const playAudioTrack = useCallback((id: string, url: string) => {
    if (!audioPlayerRef.current) return;
    audioPlayerRef.current.pause();
    audioPlayerRef.current.src = url;
    setActiveAudioId(id);
    audioPlayerRef.current
      .play()
      .then(() => setIsPlayingAudio(true))
      .catch((err) => {
        console.warn("Audio autoplay blocked or failed:", err);
        setIsPlayingAudio(false);
      });
  }, []);

  // Multi-Turn Voice Pipeline: Query + History → /chat → /tts → Play Audio
  const handleProcessQuery = useCallback(
    async (queryText: string) => {
      const cleanQuery = queryText.trim();
      if (!cleanQuery) return;

      const userMsgId = "user-" + Date.now();
      const userMessage: ConversationMessage = {
        id: userMsgId,
        role: "user",
        content: cleanQuery,
        timestamp: formatTimestamp(),
      };

      // Add user message to conversation list
      setMessages((prev) => [...prev, userMessage]);
      setInterimTranscript("");
      setIsProcessing(true);
      setProcessingStatus("Thinking...");
      setErrorMessage(null);
      setIsPopupBlocked(false);

      // Stop any ongoing audio playback
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        setIsPlayingAudio(false);
      }

      try {
        // Prepare multi-turn history from current conversation
        const history = messagesRef.current.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // Step 1: Call /chat API with query & conversation history
        const { reply: assistantReply, music_url } = await sendChatMessage(
          cleanQuery,
          history
        );

        // Step 1.5: Handle YouTube music link & auto-open
        if (music_url) {
          try {
            const popup = window.open(music_url, "_blank", "noopener,noreferrer");
            if (!popup || popup.closed || typeof popup.closed === "undefined") {
              setIsPopupBlocked(true);
            }
          } catch (e) {
            console.warn("Popup blocked by browser:", e);
            setIsPopupBlocked(true);
          }
        }

        // Step 2: Call /tts API to generate neural voice audio
        setProcessingStatus("Generating voice...");
        const langCode = language === "ur-PK" ? "ur" : "en";
        const audioBlobUrl = await fetchSpeechAudio(
          assistantReply,
          undefined,
          langCode
        );

        const assistantMsgId = "asst-" + Date.now();
        const assistantMessage: ConversationMessage = {
          id: assistantMsgId,
          role: "assistant",
          content: assistantReply,
          musicUrl: music_url,
          audioBlobUrl: audioBlobUrl,
          timestamp: formatTimestamp(),
        };

        // Append assistant response to conversation list
        setMessages((prev) => [...prev, assistantMessage]);

        // Step 3: Automatically speak out the response
        playAudioTrack(assistantMsgId, audioBlobUrl);
      } catch (err: any) {
        console.error("Voice pipeline error:", err);
        setErrorMessage(
          err.message || "Something went wrong while connecting to the assistant."
        );
      } finally {
        setIsProcessing(false);
        setProcessingStatus("");
      }
    },
    [language, playAudioTrack]
  );

  // Configure Web Speech API
  useEffect(() => {
    if (typeof window === "undefined") return;

    const win = window as unknown as IWindow;
    const SpeechRecognition =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        "Web Speech API is not supported in this browser. Please open in Google Chrome or Microsoft Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMessage(null);
    };

    recognition.onresult = (event: any) => {
      let current = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setInterimTranscript(current);
      transcriptRef.current = current;
    };

    recognition.onerror = (event: any) => {
      console.error("SpeechRecognition error:", event.error);
      setIsListening(false);
      if (event.error !== "no-speech") {
        setErrorMessage(`Microphone error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      const spokenText = transcriptRef.current.trim();
      if (shouldAutoSubmitRef.current && spokenText) {
        transcriptRef.current = "";
        setInterimTranscript("");
        handleProcessQuery(spokenText);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {}
    };
  }, [language, handleProcessQuery]);

  // Audio player onended listener
  useEffect(() => {
    const audioEl = audioPlayerRef.current;
    if (!audioEl) return;

    const handleEnded = () => {
      setIsPlayingAudio(false);
      setActiveAudioId(null);
    };
    audioEl.addEventListener("ended", handleEnded);
    return () => audioEl.removeEventListener("ended", handleEnded);
  }, []);

  // Mic Button Click Handler
  const toggleListening = () => {
    if (isListening) {
      shouldAutoSubmitRef.current = true;
      recognitionRef.current?.stop();
    } else {
      setInterimTranscript("");
      transcriptRef.current = "";
      shouldAutoSubmitRef.current = true;
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  // Clear conversation history
  const handleClearChat = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setMessages([]);
    setInterimTranscript("");
    setActiveAudioId(null);
    setIsPlayingAudio(false);
    setErrorMessage(null);
  };

  // Manual text submit fallback
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim() || isProcessing) return;
    const query = manualInput.trim();
    setManualInput("");
    handleProcessQuery(query);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto selection:bg-blue-500 selection:text-white">
      {/* Hidden Audio Element for TTS Playback */}
      <audio ref={audioPlayerRef} className="hidden" preload="auto" />

      {/* Header Bar */}
      <header className="w-full flex items-center justify-between py-3 border-b border-slate-800/80 sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Alexa-style AI Voice Assistant
            </h1>
            <p className="text-[11px] text-slate-400">
              OpenAI Agents SDK • Groq (Qwen 2.5)
            </p>
          </div>
        </div>

        {/* Controls: Clear Chat, Language toggle & Backend status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearChat}
              title="Clear Conversation"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 text-xs transition-all cursor-pointer active:scale-95"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          {/* Language selector */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs">
            <button
              type="button"
              onClick={() => setLanguage("en-US")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                language === "en-US"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("ur-PK")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                language === "ur-PK"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              اردو
            </button>
          </div>

          {/* Backend Status indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border ${
              backendOnline
                ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-300"
                : backendOnline === false
                ? "bg-rose-950/40 border-rose-800/80 text-rose-300"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                backendOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
              }`}
            />
            <span className="hidden sm:inline">
              {backendOnline
                ? "Ready"
                : backendOnline === false
                ? "Offline"
                : "Connecting..."}
            </span>
          </div>
        </div>
      </header>

      {/* Main Center Section: Chat Stream or Hero Welcome */}
      <main className="flex flex-col items-center flex-1 w-full my-4 overflow-y-auto min-h-[50vh]">
        {/* Error Alert */}
        {errorMessage && (
          <div className="w-full max-w-xl rounded-xl border border-rose-500/40 bg-rose-950/40 p-3.5 mb-4 text-xs sm:text-sm text-rose-200 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-rose-400 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white ml-2 text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Empty State: Hero Welcome with Large Mic */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-6 sm:py-10 space-y-6">
            <div className="py-2">
              <MicButton
                isListening={isListening}
                isProcessing={isProcessing}
                onClick={toggleListening}
                disabled={backendOnline === false}
              />
            </div>

            <div className="max-w-md space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                How can I help you today?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Tap the microphone to speak, or type your request below. I can search the web, tell the time, play music on YouTube, and chat in Urdu & English.
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg pt-2 text-xs">
              <button
                type="button"
                onClick={() => handleProcessQuery("Play Sanam Re song")}
                className="rounded-full border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 text-slate-300 hover:border-red-500/50 hover:text-red-300 transition-colors cursor-pointer"
              >
                🎵 &quot;Play Sanam Re song&quot;
              </button>
              <button
                type="button"
                onClick={() => handleProcessQuery("What time is it now?")}
                className="rounded-full border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                🕒 &quot;What time is it now?&quot;
              </button>
              <button
                type="button"
                onClick={() => handleProcessQuery("Search latest AI news")}
                className="rounded-full border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 text-slate-300 hover:border-blue-500/50 hover:text-blue-300 transition-colors cursor-pointer"
              >
                🔍 &quot;Search latest AI news&quot;
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage("ur-PK");
                  handleProcessQuery("Sanam re gana lagao");
                }}
                className="rounded-full border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                🇵🇰 &quot;Sanam re gana lagao&quot;
              </button>
            </div>
          </div>
        ) : (
          /* Multi-Turn Conversation Stream (ChatGPT style) */
          <div className="w-full max-w-2xl flex-1 flex flex-col justify-start">
            <ChatMessagesList
              messages={messages}
              activeAudioId={activeAudioId}
              isPlayingAudio={isPlayingAudio}
              onPlayAudio={playAudioTrack}
              isProcessing={isProcessing}
              processingStatus={processingStatus}
              isListening={isListening}
              interimTranscript={interimTranscript}
              isPopupBlocked={isPopupBlocked}
            />
          </div>
        )}
      </main>

      {/* Footer Area: Bottom Mic & Input Bar */}
      <footer className="w-full space-y-3 pt-2 sticky bottom-0 z-30 bg-slate-950/90 backdrop-blur-md">
        <form
          onSubmit={handleManualSubmit}
          className="relative flex w-full max-w-2xl mx-auto items-center gap-2"
        >
          {/* Compact Mic Button in Input Row */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={isProcessing || backendOnline === false}
            title={isListening ? "Stop listening" : "Speak with microphone"}
            className={`h-11 w-11 shrink-0 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              isListening
                ? "bg-red-600 text-white animate-pulse shadow-red-600/50 scale-105"
                : isProcessing
                ? "bg-slate-800 text-cyan-400 opacity-60 cursor-wait"
                : "bg-slate-900 border border-slate-700 text-cyan-400 hover:border-cyan-400 hover:scale-105"
            }`}
          >
            {isListening ? (
              <span className="w-3 h-3 bg-white rounded-sm animate-pulse" />
            ) : (
              <svg
                className="w-5 h-5"
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

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder={
                isListening
                  ? "Listening to your voice..."
                  : "Type your message or click microphone..."
              }
              disabled={isProcessing}
              className="w-full rounded-full border border-slate-800 bg-slate-900/90 px-5 py-3 pr-12 text-sm text-slate-100 placeholder-slate-500 backdrop-blur-md focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
            <button
              type="submit"
              disabled={!manualInput.trim() || isProcessing}
              aria-label="Send message"
              className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}

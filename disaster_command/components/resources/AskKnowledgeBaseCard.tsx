"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Search,
  Bot,
  User,
  Loader2,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AskKnowledgeBaseCardProps {
  isReady?: boolean;
  isSearching?: boolean;
}

export function AskKnowledgeBaseCard({
  isReady = false,
  isSearching = false,
}: AskKnowledgeBaseCardProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    if (!isReady) {
      const warningMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "Please feed the documents to RAG first to enable document-specific Q&A. I'm currently operating in general mode.",
        timestamp: new Date(),
      };
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() - 1).toString(),
          role: "user",
          content: query,
          timestamp: new Date(),
        },
        warningMessage,
      ]);
      setQuery("");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setIsProcessing(true);

    setTimeout(() => {
      const responses = [
        "Based on the Disaster Response Strategy documents, I recommend initiating Tier-2 escalation protocols for scenarios involving more than 3 affected sectors. The key decision points are: establish command chain within 5 minutes, deploy reconnaissance drones immediately, and triangulate survivor locations using thermal + visual feeds.",
        "According to the Survivor Detection & Rescue Coordination Guide, the optimal drone swarm configuration for urban disaster zones is: 4 units in scanning mode with 15-minute battery reserves, 2 units in relay mode, and 1 unit on standby for medical supply delivery.",
        "The Environment & Hazard Knowledge base indicates that seismic activity above 5.0 magnitude typically requires evacuation protocols for a 2km radius. Structural collapse probability increases by 340% for buildings older than 30 years without seismic retrofitting.",
        "Based on Decision-Making Heuristics, when facing ambiguous survivor signals, prioritize false-positive tolerance over missed detections. The recommended approach is: scan → mark → verify → rescue within 8-minute windows.",
      ];

      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: randomResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full flex-1"
    >
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-slate-900" />
              <h3 className="text-lg font-bold text-slate-900">
                Ask Your Knowledge Base
              </h3>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Process your documents first to enable Q&A
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              title="Clear chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {!isReady && messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
            <MessageSquare className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-400">
            RAG to start asking questions
          </p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-96 max-h-96 lg:max-h-[28rem]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                  <Bot className="w-7 h-7 text-indigo-600" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">
                  Ready to Answer
                </h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Ask anything about your disaster response documents. Try
                  questions like:
                </p>
                <div className="mt-4 space-y-2 text-left w-full max-w-sm">
                  {[
                    "What are the Tier-2 escalation protocols?",
                    "How should I configure drone swarms?",
                    "What evacuation radius is recommended?",
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(suggestion)}
                      className="w-full text-left px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-medium text-slate-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                        <Bot className="w-4 h-4 text-indigo-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        message.role === "user"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          message.role === "user"
                            ? "text-indigo-200"
                            : "text-slate-400"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                      <Bot className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing your query...
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isReady
                      ? "Ask about your documents..."
                      : "Process documents to enable Q&A"
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={!query.trim() || isProcessing}
                className="px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <div
                className={`w-1.5 h-1.5 rounded-full ${isReady ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
              />
              <span>
                {isReady ? "RAG system ready" : "Awaiting document processing"}
              </span>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

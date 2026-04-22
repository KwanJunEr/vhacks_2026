"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Database,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { KnowledgeBaseCard } from "@/components/resources/KnowledgeBaseCard";
import { AskKnowledgeBaseCard } from "@/components/resources/AskKnowledgeBaseCard";
import Link from "next/link";

export default function ResourcesPage() {
  const [isRagReady, setIsRagReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vectorCount, setVectorCount] = useState(0);

  const handleFeedToRAG = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsRagReady(true);
      setVectorCount(247);
    }, 3000);
  };

  const handleReset = () => {
    setIsRagReady(false);
    setVectorCount(0);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="glass-panel rounded-xl border border-slate-200 bg-white/75 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
                AI-Powered Systems
              </p>
            </div>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Data Intelligence Layer
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Upload documents to your knowledge base and query them using
              RAG-powered AI
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col h-full"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Database className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Document Management
            </h2>
          </div>
          <KnowledgeBaseCard
            onFeedToRAG={handleFeedToRAG}
            onReset={handleReset}
            isProcessing={isProcessing}
            isReady={isRagReady}
            vectorStoreCount={vectorCount}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col h-full"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Query System</h2>
          </div>
          <AskKnowledgeBaseCard isReady={isRagReady} />
        </motion.div>
      </div>
    </div>
  );
}

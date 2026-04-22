"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Eye,
  Database,
  Sparkles,
  RotateCcw,
  Loader2,
  CheckCircle2,
  X,
  FileIcon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Document {
  id: string;
  name: string;
  size: string;
  pages: number;
  uploadedAt: string;
  type: string;
}

interface KnowledgeBaseCardProps {
  onFeedToRAG?: () => void;
  onReset?: () => void;
  isProcessing?: boolean;
  isReady?: boolean;
  vectorStoreCount?: number;
}

const initialDocuments: Document[] = [
  {
    id: "1",
    name: "Decision-Making Heuristics & Resource Optimization.pdf",
    size: "2.4 MB",
    pages: 3,
    uploadedAt: "2026-03-15",
    type: "pdf",
  },
  {
    id: "2",
    name: "Disaster Response Strategy.pdf",
    size: "1.8 MB",
    pages: 3,
    uploadedAt: "2026-03-14",
    type: "pdf",
  },
  {
    id: "3",
    name: "Environment & Hazard Knowledge.pdf",
    size: "3.1 MB",
    pages: 5,
    uploadedAt: "2026-03-13",
    type: "pdf",
  },
  {
    id: "4",
    name: "Survivor Detection & Rescue Coordination Guide.pdf",
    size: "2.9 MB",
    pages: 5,
    uploadedAt: "2026-03-12",
    type: "pdf",
  },
];

export function KnowledgeBaseCard({
  onFeedToRAG,
  onReset,
  isProcessing = false,
  isReady = false,
  vectorStoreCount = 0,
}: KnowledgeBaseCardProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          const newDoc: Document = {
            id: Date.now().toString(),
            name: files[0].name,
            size: `${(files[0].size / (1024 * 1024)).toFixed(1)} MB`,
            pages: Math.floor(Math.random() * 20) + 5,
            uploadedAt: new Date().toISOString().split("T")[0],
            type: files[0].type.includes("pdf") ? "pdf" : "doc",
          };
          setDocuments((prev) => [newDoc, ...prev]);
          setIsUploading(false);
          return 0;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handlePreview = (doc: Document) => {
    setSelectedDoc(doc);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <div className="space-y-6 h-full flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1"
        >
          <div className="bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Knowledge Base
                  </h3>
                  <p className="text-xs text-white/70">
                    Document management system
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white">
                {documents.length} Documents
              </span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />

            <div
              onClick={handleUpload}
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
            >
              {isUploading ? (
                <div className="space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                  <p className="text-sm font-medium text-slate-600">
                    Uploading... {uploadProgress}%
                  </p>
                  <Progress
                    value={uploadProgress}
                    className="mx-auto max-w-xs"
                  />
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-indigo-500 transition-colors" />
                  <p className="text-sm font-medium text-slate-600">
                    Click to upload documents
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PDF, DOC up to 10MB
                  </p>
                </>
              )}
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <FileIcon className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {doc.pages} pages • {doc.size}
                    </p>
                  </div>
                  <button
                    onClick={() => handlePreview(doc)}
                    className="p-2 rounded-lg bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50"
                  >
                    <Eye className="w-4 h-4 text-indigo-600" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                RAG Processing
              </h3>
              <p className="text-xs text-slate-500">
                Vector storage & embeddings
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${isReady ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}
                />
                <span className="text-sm font-medium text-slate-700">
                  {isReady ? "Ready for queries" : "Processing embeddings"}
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-600">
                {vectorStoreCount} vectors
              </span>
            </div>

            {isProcessing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing documents...
                </div>
                <Progress value={75} className="h-2" />
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={onFeedToRAG}
                  disabled={documents.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  RAG
                </button>
                <button
                  onClick={onReset}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isPreviewOpen && selectedDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <FileIcon className="w-5 h-5 text-red-500" />
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {selectedDoc.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {selectedDoc.pages} pages • {selectedDoc.size}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 bg-slate-50 relative overflow-hidden">
                <iframe
                  src={`/documents/${selectedDoc.name}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full border-none"
                  title="PDF Preview"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

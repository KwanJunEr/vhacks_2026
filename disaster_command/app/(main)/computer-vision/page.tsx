'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, Loader2, Upload, WandSparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type VisionMode = 'idle' | 'uploaded' | 'analyzing' | 'analyzed'

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

interface ComputerVisionAnalyzeResponse {
  original_filename: string
  analyzed_filename: string
  analyzed_path: string
  message: string
}

export default function ComputerVisionPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const analyzeTimerRef = useRef<number | null>(null)
  const originalVideoUrlRef = useRef<string | null>(null)

  const [mode, setMode] = useState<VisionMode>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [originalVideoUrl, setOriginalVideoUrl] = useState<string | null>(null)
  const [analyzedVideoUrl, setAnalyzedVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const activeVideoUrl = analyzedVideoUrl ?? originalVideoUrl

  const modeLabel = useMemo(() => {
    switch (mode) {
      case 'uploaded':
        return 'Original'
      case 'analyzing':
        return 'Analyzing'
      case 'analyzed':
        return 'Analyzed'
      default:
        return 'Idle'
    }
  }, [mode])

  useEffect(() => {
    return () => {
      if (analyzeTimerRef.current) {
        window.clearTimeout(analyzeTimerRef.current)
      }

      if (originalVideoUrlRef.current) {
        URL.revokeObjectURL(originalVideoUrlRef.current)
      }
    }
  }, [])

  const resetFlow = () => {
    if (analyzeTimerRef.current) {
      window.clearTimeout(analyzeTimerRef.current)
      analyzeTimerRef.current = null
    }

    if (originalVideoUrlRef.current) {
      URL.revokeObjectURL(originalVideoUrlRef.current)
      originalVideoUrlRef.current = null
    }

    setMode('idle')
    setSelectedFile(null)
    setOriginalVideoUrl(null)
    setAnalyzedVideoUrl(null)
    setError(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('video/') || !file.name.toLowerCase().endsWith('.mp4')) {
      setError('Please upload an MP4 video file.')
      event.target.value = ''
      return
    }

    if (analyzeTimerRef.current) {
      window.clearTimeout(analyzeTimerRef.current)
      analyzeTimerRef.current = null
    }

    if (originalVideoUrlRef.current) {
      URL.revokeObjectURL(originalVideoUrlRef.current)
    }

    const nextOriginalVideoUrl = URL.createObjectURL(file)
    originalVideoUrlRef.current = nextOriginalVideoUrl

    setSelectedFile(file)
    setOriginalVideoUrl(nextOriginalVideoUrl)
    setAnalyzedVideoUrl(null)
    setMode('uploaded')
    setError(null)
  }

  const handleUploadClick = () => {
    if (mode === 'analyzing') {
      return
    }

    fileInputRef.current?.click()
  }

  const handleAnalyze = () => {
    if (!selectedFile || !originalVideoUrl || mode !== 'uploaded') {
      setError('Please upload a supported MP4 file before analyzing.')
      return
    }

    setMode('analyzing')
    setError(null)

    const runAnalysis = async () => {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/computer-vision/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            original_filename: selectedFile.name,
          }),
        })

        const data = (await response.json()) as ComputerVisionAnalyzeResponse & { detail?: string; error?: string }

        if (!response.ok) {
          throw new Error(data.detail || data.error || 'Analysis failed')
        }

        await new Promise((resolve) => {
          analyzeTimerRef.current = window.setTimeout(() => {
            analyzeTimerRef.current = null
            resolve(null)
          }, 2500)
        })

        setAnalyzedVideoUrl(data.analyzed_path)
        setMode('analyzed')
      } catch (analysisError) {
        setMode('uploaded')
        setError(
          `Error: ${analysisError instanceof Error ? analysisError.message : 'Unknown error'}`,
        )
      }
    }

    void runAnalysis()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Computer Vision</h1>
        <p className="mt-1 text-slate-600">Drone Video Analyzer for collapsed building detection</p>
      </div>

      <Tabs defaultValue="video-analyzer" className="w-full">
        <TabsList variant="line" className="mb-4">
          <TabsTrigger value="video-analyzer">Drone Video Analyzer</TabsTrigger>
        </TabsList>

        <TabsContent value="video-analyzer">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <WandSparkles className="h-5 w-5" />
                    One-Tab Analysis Workflow
                  </CardTitle>
                  <CardDescription>
                    Upload a drone MP4, preview the original clip, then analyze it into the prepared result video.
                  </CardDescription>
                </div>
                <Badge variant="secondary">{modeLabel}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,.mp4"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="grid gap-3 sm:grid-cols-3">
                <Button type="button" onClick={handleUploadClick} disabled={mode === 'analyzing'}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>

                <Button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={mode !== 'uploaded' || !selectedFile || !originalVideoUrl}
                >
                  {mode === 'analyzing' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <WandSparkles className="mr-2 h-4 w-4" />
                  )}
                  Analyze
                </Button>

                <Button type="button" variant="outline" onClick={resetFlow} disabled={mode === 'idle'}>
                  Reset
                </Button>
              </div>

              {error && (
                <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-950 p-3 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3 text-sm text-slate-100">
                  <span className="font-medium">Current Video Player</span>
                  {selectedFile ? <span className="text-slate-300">{selectedFile.name}</span> : <span className="text-slate-400">No file uploaded</span>}
                </div>

                <div className="relative overflow-hidden rounded-lg bg-black">
                  {activeVideoUrl ? (
                    <video src={activeVideoUrl} controls className="h-full w-full max-h-[480px] min-h-[320px] object-contain" />
                  ) : (
                    <div className="flex min-h-[320px] items-center justify-center px-6 py-10 text-center text-slate-400">
                      <div>
                        <p className="text-lg font-medium text-slate-200">Upload a drone MP4 to begin</p>
                        <p className="mt-2 text-sm">The original clip will appear here first, then the analyzed result will replace it.</p>
                      </div>
                    </div>
                  )}

                  {mode === 'analyzing' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/90 px-6 py-5 text-slate-100 shadow-xl">
                        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                        <div className="text-center">
                          <p className="font-semibold">Analyzing collapsed building damage...</p>
                          <p className="text-sm text-slate-300">Please wait while the video is processed.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                  <span className="rounded-full bg-slate-800 px-3 py-1">State: {mode}</span>
                  {selectedFile && <span className="rounded-full bg-slate-800 px-3 py-1">File: {selectedFile.name}</span>}
                  {analyzedVideoUrl && <span className="rounded-full bg-slate-800 px-3 py-1">Result loaded</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

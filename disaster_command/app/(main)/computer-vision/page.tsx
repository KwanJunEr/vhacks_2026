'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Upload, Camera, Loader2, Download, CheckCircle } from 'lucide-react'

interface AnalysisResult {
  fileName: string
  fileSize: string
  analyzedFileName: string
  outputPath: string
  message: string
}

export default function ComputerVisionPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [webcamStatus, setWebcamStatus] = useState('')
  const [isWebcamActive, setIsWebcamActive] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type.startsWith('video/') || file.type.startsWith('image/'))) {
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setError(null)
      setAnalysisResult(null)
    } else {
      setError('Please select a valid video or image file')
    }
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!videoFile) {
      setError('Please select a file first')
      return
    }

    setIsUploading(true)
    setUploadProgress('Uploading video...')
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', videoFile)

      setUploadProgress('Sending to server...')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setUploadProgress('Analysis complete! Processing results...')
      
      setAnalysisResult({
        fileName: data.fileName,
        fileSize: (data.fileSize / 1024 / 1024).toFixed(2),
        analyzedFileName: data.analyzedFileName,
        outputPath: data.outputPath,
        message: data.message,
      })

      setUploadProgress('')
    } catch (error) {
      console.error('Error:', error)
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setUploadProgress('')
    } finally {
      setIsUploading(false)
    }
  }

  const handleWebcam = async () => {
    if (isWebcamActive) {
      setWebcamStatus('')
      setIsWebcamActive(false)
      return
    }

    setIsWebcamActive(true)
    setWebcamStatus('Starting webcam detection... A window will open on your screen. Press Q to close.')
    setError(null)

    try {
      const response = await fetch('/api/webcam', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Webcam failed')
      }

      setWebcamStatus(`✅ ${data.message}`)
    } catch (error) {
      console.error('Error:', error)
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setWebcamStatus('')
    } finally {
      setIsWebcamActive(false)
    }
  }

  const isImage = videoFile?.type.startsWith('image/')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Computer Vision</h1>
        <p className="text-slate-600 mt-1">Victim Detection & Analysis</p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload & Analyze
          </CardTitle>
          <CardDescription>
            Upload video or image files for victim detection analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Video or Image File
              </label>
              <input
                type="file"
                accept=".mp4,.avi,.mov,.mkv,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={isUploading}
                className="block w-full text-sm text-slate-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                  disabled:opacity-50
                  cursor-pointer border border-slate-300 rounded-lg p-2"
              />
            </div>

            {videoFile && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                <p><strong>📁 Selected:</strong> {videoFile.name}</p>
                <p><strong>💾 Size:</strong> {(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {uploadProgress && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <p className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadProgress}
                </p>
                <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-pulse" style={{ width: '100%' }}></div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={!videoFile || isUploading}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Analyzing...' : 'Upload & Analyze'}
              </Button>

              <Button
                type="button"
                onClick={handleWebcam}
                disabled={isUploading}
                variant="outline"
              >
                <Camera className="w-4 h-4 mr-2" />
                {isWebcamActive ? 'Stop Webcam' : 'Open Webcam'}
              </Button>
            </div>

            {webcamStatus && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700">
                <p>{webcamStatus}</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {previewUrl && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isImage ? '🖼️ Original Image' : '📹 Original Video'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isImage ? (
              <img
                src={previewUrl}
                alt="preview"
                className="w-full rounded-lg bg-slate-100 max-h-96 object-contain"
              />
            ) : (
              <video
                src={previewUrl}
                controls
                className="w-full rounded-lg bg-slate-100"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Analysis Results Section */}
      {analysisResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="w-5 h-5" />
              Analysis Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-slate-900 mb-3">Analysis Results:</p>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Input: {analysisResult.fileName}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Size: {analysisResult.fileSize} MB</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Output: {analysisResult.analyzedFileName}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Status: {analysisResult.message}</span>
                </li>
              </ul>
            </div>

            {/* Analyzed Results */}
            {analysisResult.outputPath && (
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-semibold text-slate-900 mb-3">
                  {isImage ? '🎯 Analyzed Image (Detections)' : '🎯 Analyzed Video (Detections)'}
                </p>
                {isImage ? (
                  <img
                    src={analysisResult.outputPath}
                    alt="analyzed"
                    className="w-full rounded-lg bg-slate-100 max-h-96 object-contain"
                  />
                ) : (
                  <video
                    src={analysisResult.outputPath}
                    controls
                    className="w-full rounded-lg bg-slate-100"
                  />
                )}
              </div>
            )}

            {analysisResult.outputPath && (
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-semibold text-slate-900 mb-3">
                  Download Analyzed {isImage ? 'Image' : 'Video'}:
                </p>
                <a
                  href={analysisResult.outputPath}
                  download
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  <Download className="w-4 h-4" />
                  Download {isImage ? 'Image' : 'Video'}
                </a>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-900">
              <p>
                <strong>💡 Tip:</strong> The analyzed {isImage ? 'image' : 'video'} contains detection boxes around detected persons/objects in the disaster scene.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

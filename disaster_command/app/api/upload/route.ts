import { writeFile, unlink, readdir } from 'fs/promises'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { existsSync, mkdirSync } from 'fs'

const execFileAsync = promisify(execFile)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
      return Response.json(
        { error: 'Invalid file type. Please upload a video or image file.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save uploaded file to uploads folder
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    const timestamp = Date.now()
    const uploadedFileName = `${timestamp}_${file.name}`
    const uploadPath = path.join(uploadDir, uploadedFileName)

    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    // Write file
    await writeFile(uploadPath, buffer)

    console.log(`\n📹 File uploaded: ${uploadPath}`)
    console.log(`📊 File size: ${(file.size / 1024 / 1024).toFixed(2)} MB\n`)

    // Run victim detection analysis
    const outputDir = path.join(process.cwd(), 'public', 'analyzed_videos')
    const outputName = `analyzed_${timestamp}`

    try {
      console.log('🚀 Starting YOLOv8 analysis...')
      console.log('='.repeat(60))
      
      // Run Python detection script
      const backendPath = path.join(process.cwd(), '..', 'backend', 'detect_victims.py')
      
      const { stdout, stderr } = await execFileAsync('python', [
        backendPath,
        '--source', uploadPath,
        '--project', outputDir,
        '--name', outputName,
        '--imgsz', '480',
        '--conf', '0.5'
      ], {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 600000 // 10 minutes
      })

      console.log(stdout)
      if (stderr) console.log('[stderr]', stderr)

      console.log('='.repeat(60))
      console.log('✅ Analysis complete!\n')

      // Find the analyzed file
      const analyzeOutputDir = path.join(outputDir, outputName)
      let analyzedFileName = ''
      let outputPath_file = ''

      try {
        const files = await readdir(analyzeOutputDir)
        // Look for predict.mp4, predict.avi, or predict file
        const predictFile = files.find(f => f.startsWith('predict'))
        if (predictFile) {
          analyzedFileName = predictFile
          outputPath_file = `/analyzed_videos/${outputName}/${predictFile}`
        }
      } catch (err) {
        console.error('Error reading output directory:', err)
      }

      if (!outputPath_file) {
        // Fallback - try to find any media file
        try {
          const files = await readdir(analyzeOutputDir)
          const mediaFile = files.find(f => /\.(mp4|avi|jpg|jpeg|png)$/i.test(f))
          if (mediaFile) {
            outputPath_file = `/analyzed_videos/${outputName}/${mediaFile}`
            analyzedFileName = mediaFile
          }
        } catch (err) {
          console.error('Error finding media file:', err)
        }
      }

      return Response.json({
        fileName: uploadedFileName,
        fileSize: buffer.length,
        analyzedFileName,
        outputPath: outputPath_file || null,
        message: 'File analysis complete! Detection results saved.',
      })

    } catch (error) {
      console.error('Analysis error:', error)
      return Response.json(
        { 
          error: error instanceof Error ? error.message : 'Analysis failed',
          fileName: uploadedFileName,
          fileSize: buffer.length,
          analyzedFileName: '',
          outputPath: null,
          message: 'Analysis failed - check server logs'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Upload error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

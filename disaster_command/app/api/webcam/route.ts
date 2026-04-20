import { execFile } from 'child_process'
import { resolve } from 'path'

export async function POST() {
  try {
    const scriptPath = resolve(process.cwd(), '..', 'backend', 'detect_victims.py')
    
    // Spawn webcam detection process in background
    const pythonProcess = execFile('python', [
      scriptPath,
      '--source', '0',
      '--conf', '0.5',
      '--imgsz', '480',
    ])

    // Don't wait - let it run in background
    pythonProcess.stdout?.on('data', (data) => {
      console.log(`[WEBCAM] ${data.toString().trim()}`)
    })

    pythonProcess.stderr?.on('data', (data) => {
      console.log(`[WEBCAM ERROR] ${data.toString().trim()}`)
    })

    pythonProcess.on('close', (code) => {
      console.log(`[WEBCAM] Process exited with code ${code}`)
    })

    // Return immediately
    return Response.json({
      message: 'Webcam detection started. Check your screen for the camera window. Press Q to close.',
      success: true,
    })

  } catch (error) {
    console.error('Webcam error:', error)
    return Response.json(
      { error: `Failed to start webcam: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

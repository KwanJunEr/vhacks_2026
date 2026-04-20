# -*- coding: utf-8 -*-
import argparse
from pathlib import Path
import cv2
import subprocess
import os
import sys
import tempfile
import numpy as np
from inference_sdk import InferenceHTTPClient
from dotenv import load_dotenv

# Load environment variables from .env (at project root)
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

# Fix Windows console encoding for emoji
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


def parse_args():
    parser = argparse.ArgumentParser(description="YOLOv8 disaster victim spotting (template)")
    parser.add_argument("--source", type=str, required=True, help="Path, folder, URL, or webcam index")
    parser.add_argument("--weights", type=str, default="ml/yolov8/weights/best.pt", help="Path to YOLOv8 weights")
    parser.add_argument("--conf", type=float, default=0.5, help="Confidence threshold")
    parser.add_argument("--iou", type=float, default=0.45, help="IoU threshold")
    parser.add_argument("--imgsz", type=int, default=480, help="Inference image size (lower = faster)")
    parser.add_argument("--device", type=str, default="cpu", help="cpu or cuda:0")
    parser.add_argument("--save_txt", action="store_true", help="Save labels as txt")
    parser.add_argument("--project", type=str, default="ml/yolov8/outputs", help="Output directory")
    parser.add_argument("--name", type=str, default="victim_spotting", help="Run name")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="Model size: yolov8n (nano-fast), yolov8m (medium)")
    return parser.parse_args()


def main():
    args = parse_args()

    # Initialize Roboflow client - LOCAL INFERENCE SERVER
    print("[*] Connecting to local Roboflow inference server...")
    
    roboflow_url = os.getenv("ROBOFLOW_API_URL")
    roboflow_key = os.getenv("ROBOFLOW_API_KEY")
    model_id = os.getenv("ROBOFLOW_MODEL_ID")
    
    if not all([roboflow_url, roboflow_key, model_id]):
        print("ERROR: Missing Roboflow credentials in .env file!")
        print("Please ensure .env contains: ROBOFLOW_API_URL, ROBOFLOW_API_KEY, ROBOFLOW_MODEL_ID")
        return
    
    client = InferenceHTTPClient(
        api_url=roboflow_url,
        api_key=roboflow_key
    )

    # If source is webcam (0), handle real-time display
    if str(args.source) == "0":
        print("Opening webcam... Press 'q' to quit")
        print(f"Using Roboflow model: {model_id}")
        print(f"Confidence threshold: {args.conf}")
        
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("ERROR: Cannot open webcam!")
            return
        
        # Set camera resolution for better display
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        
        # Create window
        cv2.namedWindow("Roboflow Victim Detector (Press Q to Quit)")
        
        # Force window to foreground on Windows
        if sys.platform == 'win32':
            try:
                hwnd = ctypes.windll.user32.FindWindowW(None, "Roboflow Victim Detector (Press Q to Quit)")
                if hwnd:
                    ctypes.windll.user32.SetForegroundWindow(hwnd)
                    ctypes.windll.user32.ShowWindow(hwnd, 5)  # SW_SHOW
            except Exception as e:
                print(f"[INFO] Could not set window focus: {e}")
        
        print("[INFO] Webcam window created. Processing frames...")
        
        frame_count = 0
        inference_skip = 1  # Process every frame for maximum speed
        frame_idx = 0
        last_detections = []  # Cache last detections for non-inference frames
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_idx += 1
            
            # Prepare frame for display
            annotated_frame = frame.copy()
            
            # Run inference only on selected frames
            if frame_idx % inference_skip == 0:
                # Save frame temporarily for Roboflow inference
                temp_dir = tempfile.gettempdir()
                temp_frame_path = os.path.join(temp_dir, "yolo_frame.jpg")
                cv2.imwrite(temp_frame_path, frame)
                
                # Run detection on frame
                try:
                    result = client.infer(temp_frame_path, model_id=model_id)
                    
                    if "predictions" in result:
                        last_detections = []  # Clear old detections
                        for pred in result["predictions"]:
                            # Filter by confidence threshold
                            if pred.get('confidence', 0) < args.conf:
                                continue
                            last_detections.append(pred)
                            frame_count += 1
                    else:
                        last_detections = []
                    
                except Exception as e:
                    print(f"Inference error: {e}")
            
            # Draw cached detections on all frames (even non-inference frames)
            for pred in last_detections:
                x, y, w, h = pred["x"], pred["y"], pred["width"], pred["height"]
                x1, y1 = int(x - w/2), int(y - h/2)
                x2, y2 = int(x + w/2), int(y + h/2)
                
                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                
                # Add label
                label = f"{pred.get('class', 'victim')} ({pred.get('confidence', 0):.2f})"
                cv2.putText(annotated_frame, label, (x1, y1-10), 
                          cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
            
            # Always display frame (with or without detections)
            cv2.imshow("Roboflow Victim Detector (Press Q to Quit)", annotated_frame)
            
            # Handle window and quit
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q') or key == ord('Q') or key == 27:  # Q or ESC
                break
        
        cap.release()
        cv2.destroyAllWindows()
        print(f"Done. Total detections: {frame_count}")
    else:
        # For video/image files, process with Roboflow
        print(f"Processing: {args.source}")
        
        source_path = Path(args.source)
        if not source_path.exists():
            print(f"Error: Source file not found: {args.source}")
            return
        
        # Create output directory
        output_dir = Path(args.project) / args.name
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Determine if source is video or image
        video_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv'}
        image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
        
        is_video = source_path.suffix.lower() in video_extensions
        
        total_detections = 0
        frames_processed = 0
        
        if is_video:
            # Process video
            cap = cv2.VideoCapture(str(source_path))
            if not cap.isOpened():
                print(f"Error: Cannot open video: {args.source}")
                return
            
            # Get video properties
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            print(f"[VIDEO] {width}x{height} @ {fps}fps, {total_frames} frames")
            
            # Video writer for output
            fourcc = cv2.VideoWriter_fourcc(*'MJPG')  # Motion JPEG
            out_video_path = output_dir / f"predict.avi"
            out = cv2.VideoWriter(str(out_video_path), fourcc, fps, (width, height))
            
            frame_idx = 0
            skip_frames = max(1, args.imgsz // 100)  # Skip frames based on imgsz
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_idx += 1
                
                # Skip frames for speed
                if frame_idx % skip_frames != 0:
                    out.write(frame)  # Write unprocessed frame
                    continue
                
                frames_processed += 1
                
                # Save frame temporarily
                temp_frame_path = str(output_dir / "temp_frame.jpg")
                cv2.imwrite(temp_frame_path, frame)
                
                # Run inference
                try:
                    result = client.infer(temp_frame_path, model_id=model_id)
                    
                    # Draw boxes on frame
                    annotated_frame = frame.copy()
                    if "predictions" in result:
                        for pred in result["predictions"]:
                            # Filter by confidence threshold
                            if pred.get('confidence', 0) < args.conf:
                                continue
                            x, y, w, h = pred["x"], pred["y"], pred["width"], pred["height"]
                            x1, y1 = int(x - w/2), int(y - h/2)
                            x2, y2 = int(x + w/2), int(y + h/2)
                            
                            cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                            
                            label = f"{pred.get('class', 'victim')} ({pred.get('confidence', 0):.2f})"
                            cv2.putText(annotated_frame, label, (x1, y1-10), 
                                      cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                            total_detections += 1
                    
                    out.write(annotated_frame)
                    
                    if frame_idx % (fps * 5) == 0:  # Print every 5 seconds
                        print(f"  Processed {frame_idx}/{total_frames} frames ({frame_idx*100//total_frames}%)")
                    
                except Exception as e:
                    print(f"[WARNING] Inference error on frame {frame_idx}: {e}")
                    out.write(frame)
            
            cap.release()
            out.release()
            
            print(f"[OK] Video processing complete!")
            print(f"  Total detections: {total_detections}")
            print(f"  Frames processed: {frames_processed}/{total_frames}")
            print(f"  Saved to: {out_video_path}")
            
        else:
            # Process single image
            try:
                result = client.infer(str(source_path), model_id=model_id)
                
                frame = cv2.imread(str(source_path))
                annotated_frame = frame.copy()
                
                if "predictions" in result:
                    for pred in result["predictions"]:
                        # Filter by confidence threshold
                        if pred.get('confidence', 0) < args.conf:
                            continue
                        x, y, w, h = pred["x"], pred["y"], pred["width"], pred["height"]
                        x1, y1 = int(x - w/2), int(y - h/2)
                        x2, y2 = int(x + w/2), int(y + h/2)
                        
                        cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                        
                        label = f"{pred.get('class', 'victim')} ({pred.get('confidence', 0):.2f})"
                        cv2.putText(annotated_frame, label, (x1, y1-10), 
                                  cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                        total_detections += 1
                
                # Save annotated image
                out_image_path = output_dir / source_path.name
                cv2.imwrite(str(out_image_path), annotated_frame)
                
                print(f"[OK] Image processing complete!")
                print(f"  Total detections: {total_detections}")
                print(f"  Saved to: {out_image_path}")
                
            except Exception as e:
                print(f"[ERROR] Inference error: {e}")
                return
        
        print(f"Done. Total detections: {total_detections}")
        print(f"Saved results under: {output_dir}")
        
        # Convert AVI to MP4 if video was processed
        if is_video:
            print("\n[*] Converting AVI to MP4 (FFmpeg)...")
            avi_files = list(output_dir.glob("*.avi"))
            if avi_files:
                avi_path = avi_files[0]
                mp4_path = avi_path.with_suffix('.mp4')
                
                try:
                    subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
                    ffmpeg_available = True
                except (FileNotFoundError, subprocess.CalledProcessError):
                    ffmpeg_available = False
                
                if not ffmpeg_available:
                    print("\n[WARNING] FFmpeg not installed - skipping MP4 conversion")
                    print("Install FFmpeg: choco install ffmpeg")
                    return
                
                try:
                    command = [
                        'ffmpeg',
                        '-i', str(avi_path),
                        '-c:v', 'libx264',
                        '-preset', 'fast',
                        '-crf', '23',
                        '-c:a', 'aac',
                        '-b:a', '128k',
                        '-movflags', '+faststart',
                        '-y',
                        str(mp4_path)
                    ]
                    
                    print(f"  Converting {avi_path.name}...")
                    result = subprocess.run(command, capture_output=True, text=True, timeout=600)
                    
                    if result.returncode == 0 and mp4_path.exists():
                        file_size_mb = mp4_path.stat().st_size / 1024 / 1024
                        os.remove(str(avi_path))
                        print(f"  [OK] Converted to MP4: {mp4_path.name}")
                        print(f"  [INFO] File size: {file_size_mb:.2f} MB")
                    else:
                        print(f"  [ERROR] FFmpeg error: {result.stderr}")
                    
                except Exception as e:
                    print(f"  [ERROR] Conversion failed: {str(e)}")


if __name__ == "__main__":
    main()

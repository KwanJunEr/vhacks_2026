# -*- coding: utf-8 -*-
"""
YOLOv8 Person Detection Script
Detects people in images, videos, and webcam feed using YOLOv8
"""
import argparse
from pathlib import Path
import cv2
import subprocess
import os
import sys
from ultralytics import YOLO
from tqdm import tqdm

try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

# Fix Windows console encoding for emoji
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


def parse_args():
    parser = argparse.ArgumentParser(description="YOLOv8 Person Detection")
    parser.add_argument("--source", type=str, required=True, help="Path to image/video, folder, URL, or webcam index (0)")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="Model: yolov8n (nano-fast), yolov8s, yolov8m, yolov8l, yolov8x")
    parser.add_argument("--conf", type=float, default=0.5, help="Confidence threshold (0-1)")
    parser.add_argument("--iou", type=float, default=0.45, help="IoU threshold for NMS (0-1)")
    parser.add_argument("--imgsz", type=int, default=640, help="Inference image size")
    parser.add_argument("--device", type=str, default="cpu", help="Device: cpu, 0, 1, etc. (auto-detected if not specified)")
    parser.add_argument("--project", type=str, default="ml/yolov8/outputs", help="Output directory")
    parser.add_argument("--name", type=str, default="person_detection", help="Run name")
    parser.add_argument("--save-txt", action="store_true", help="Save detection results as txt")
    parser.add_argument("--save-crop", action="store_true", help="Save cropped person images")
    parser.add_argument("--line-width", type=int, default=2, help="Bounding box line width")
    parser.add_argument("--fps", type=int, default=None, help="Webcam FPS (leave blank to auto-detect)")
    return parser.parse_args()


def auto_detect_device():
    """Auto-detect if CUDA is available"""
    if not TORCH_AVAILABLE:
        return "cpu"
    
    try:
        if torch.cuda.is_available():
            device = "0"
            print(f"[*] GPU detected: {torch.cuda.get_device_name(0)}")
            return device
    except Exception as e:
        print(f"[INFO] GPU check failed: {e}")
    
    return "cpu"


def load_model(model_name, device, conf, iou):
    """Load YOLOv8 model"""
    print(f"[*] Loading YOLOv8 model: {model_name}")
    model = YOLO(model_name)
    print(f"[OK] Model loaded successfully")
    return model


def process_webcam(model, args):
    """Process webcam feed"""
    print("Opening webcam... Press 'q' to quit")
    print(f"Confidence threshold: {args.conf}")
    print(f"Model: {args.model}")
    
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("ERROR: Cannot open webcam!")
        return
    
    # Set camera resolution
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    
    # Get actual resolution and FPS
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    webcam_fps = cap.get(cv2.CAP_PROP_FPS)
    
    # Use provided FPS or default to webcam's reported FPS or 30
    fps = args.fps if args.fps else (int(webcam_fps) if webcam_fps > 0 else 30)
    
    print(f"Resolution: {width}x{height}")
    print(f"FPS: {fps}")
    
    # Create output directory
    output_dir = Path(args.project) / args.name
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Create video writers
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    raw_video_path = output_dir / "raw_video.mp4"
    detected_video_path = output_dir / "detected_video.mp4"
    
    raw_writer = cv2.VideoWriter(str(raw_video_path), fourcc, fps, (width, height))
    detected_writer = cv2.VideoWriter(str(detected_video_path), fourcc, fps, (width, height))
    
    if not raw_writer.isOpened() or not detected_writer.isOpened():
        print("ERROR: Failed to initialize video writers!")
        cap.release()
        return
    
    print(f"[INFO] Saving videos to: {output_dir}")
    
    # Create display window
    cv2.namedWindow("YOLOv8 Person Detection (Press Q to Quit)", cv2.WINDOW_NORMAL)
    
    frame_count = 0
    total_people = 0
    
    print("[INFO] Recording... Press 'q' to stop")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        
        # Write raw frame
        raw_writer.write(frame)
        
        # Run detection
        results = model(frame, conf=args.conf, iou=args.iou, imgsz=args.imgsz, device=args.device, verbose=False)
        
        # Draw results on frame
        annotated_frame = results[0].plot(line_width=args.line_width)
        
        # Count people (class 0 in YOLOv8 is 'person')
        detections = results[0].boxes
        people_in_frame = sum(1 for det in detections if int(det.cls[0]) == 0)
        total_people += people_in_frame
        
        # Add detection count text on top-left corner (current frame only)
        text = f"People: {people_in_frame}"
        cv2.putText(annotated_frame, text, (15, 40), cv2.FONT_HERSHEY_SIMPLEX, 
                   1.2, (0, 255, 0), 2, cv2.LINE_AA)
        
        # Add frame number
        text_frame = f"Frame: {frame_count}"
        cv2.putText(annotated_frame, text_frame, (15, 80), cv2.FONT_HERSHEY_SIMPLEX, 
                   0.8, (200, 200, 200), 1, cv2.LINE_AA)
        
        # Write annotated frame
        detected_writer.write(annotated_frame)
        
        # Display
        cv2.imshow("YOLOv8 Person Detection (Press Q to Quit)", annotated_frame)
        
        # Check for quit
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q') or key == ord('Q') or key == 27:  # Q or ESC
            break
    
    cap.release()
    raw_writer.release()
    detected_writer.release()
    cv2.destroyAllWindows()
    
    print(f"\n[OK] Webcam recording complete!")
    print(f"  Frames captured: {frame_count}")
    print(f"  Total people detected: {total_people}")
    print(f"  Raw video: {raw_video_path}")
    print(f"  Detected video: {detected_video_path}")


def process_video(model, args):
    """Process video file"""
    source_path = Path(args.source)
    
    if not source_path.exists():
        print(f"ERROR: File not found: {args.source}")
        return
    
    print(f"Processing video: {args.source}")
    
    cap = cv2.VideoCapture(str(source_path))
    if not cap.isOpened():
        print(f"ERROR: Cannot open video: {args.source}")
        return
    
    # Get video properties
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"[VIDEO] {width}x{height} @ {fps}fps, {total_frames} frames")
    
    # Create output directory
    output_dir = Path(args.project) / args.name
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Create video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    output_video_path = output_dir / f"{source_path.stem}_detected.mp4"
    out = cv2.VideoWriter(str(output_video_path), fourcc, fps, (width, height))
    
    if not out.isOpened():
        print("ERROR: Failed to initialize video writer!")
        cap.release()
        return
    
    frame_idx = 0
    total_people = 0
    total_detections = 0
    
    print("[*] Processing frames...")
    print(f"[*] Total frames to process: {total_frames}")
    
    with tqdm(total=total_frames, desc="Analyzing", unit="frame", ncols=100, bar_format='{l_bar}{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}]') as pbar:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_idx += 1
            
            # Run detection
            results = model(frame, conf=args.conf, iou=args.iou, imgsz=args.imgsz, device=args.device, verbose=False)
            
            # Draw results
            annotated_frame = results[0].plot(line_width=args.line_width)
            
            # Count detections
            detections = results[0].boxes
            people_in_frame = sum(1 for det in detections if int(det.cls[0]) == 0)
            total_people += people_in_frame
            total_detections += len(detections)
            
            # Add people count text on top-left corner (current frame only)
            text = f"People: {people_in_frame}"
            cv2.putText(annotated_frame, text, (15, 40), cv2.FONT_HERSHEY_SIMPLEX, 
                       1.2, (0, 255, 0), 2, cv2.LINE_AA)
            
            # Add frame number
            text_frame = f"Frame: {frame_idx}/{total_frames}"
            cv2.putText(annotated_frame, text_frame, (15, 80), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.8, (200, 200, 200), 1, cv2.LINE_AA)
            
            # Save crop if requested
            if args.save_crop and people_in_frame > 0:
                for i, det in enumerate(detections):
                    if int(det.cls[0]) == 0:  # Person class
                        x1, y1, x2, y2 = map(int, det.xyxy[0])
                        crop = frame[y1:y2, x1:x2]
                        crop_path = output_dir / f"person_{frame_idx}_{i}.jpg"
                        cv2.imwrite(str(crop_path), crop)
            
            # Save txt if requested
            if args.save_txt:
                txt_path = output_dir / f"frame_{frame_idx:06d}.txt"
                with open(txt_path, 'w') as f:
                    for det in detections:
                        class_id = int(det.cls[0])
                        confidence = float(det.conf[0])
                        x1, y1, x2, y2 = map(float, det.xyxy[0])
                        f.write(f"{class_id} {confidence:.2f} {x1:.0f} {y1:.0f} {x2:.0f} {y2:.0f}\n")
            
            out.write(annotated_frame)
            
            # Update progress bar with detection info
            pbar.update(1)
            pbar.set_description(f"Analyzing [People: {total_people} | Frame People: {people_in_frame}]")
    
    print(f"\n" + "="*80)
    print(f"  Frame Count: {frame_idx}")
    print(f"  Total Detections: {total_detections}")
    print(f"  Total People Detected: {total_people}")
    print(f"="*80)
    
    cap.release()
    out.release()
    
    print(f"\n[OK] Video processing complete!")
    print(f"  Total frames: {frame_idx}")
    print(f"  Total people detected: {total_people}")
    print(f"  Output video: {output_video_path}")
    print(f"  Saved to: {output_dir}")


def process_image(model, args):
    """Process image file"""
    source_path = Path(args.source)
    
    if not source_path.exists():
        print(f"ERROR: File not found: {args.source}")
        return
    
    print(f"Processing image: {args.source}")
    
    # Read image
    frame = cv2.imread(str(source_path))
    if frame is None:
        print(f"ERROR: Cannot read image: {args.source}")
        return
    
    print(f"Image size: {frame.shape[1]}x{frame.shape[0]}")
    
    # Create output directory
    output_dir = Path(args.project) / args.name
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Run detection
    print("[*] Running detection...")
    results = model(frame, conf=args.conf, iou=args.iou, imgsz=args.imgsz, device=args.device, verbose=False)
    
    # Draw results
    annotated_frame = results[0].plot(line_width=args.line_width)
    
    # Count detections
    detections = results[0].boxes
    total_people = sum(1 for det in detections if int(det.cls[0]) == 0)
    
    print(f"  Total detections: {len(detections)}")
    print(f"  People detected: {total_people}")
    
    # Save cropped persons
    if args.save_crop:
        for i, det in enumerate(detections):
            if int(det.cls[0]) == 0:  # Person class
                x1, y1, x2, y2 = map(int, det.xyxy[0])
                crop = frame[y1:y2, x1:x2]
                crop_path = output_dir / f"person_{i}.jpg"
                cv2.imwrite(str(crop_path), crop)
                print(f"  Saved crop: {crop_path}")
    
    # Save detections as txt
    if args.save_txt:
        txt_path = output_dir / f"{source_path.stem}_detections.txt"
        with open(txt_path, 'w') as f:
            for det in detections:
                class_id = int(det.cls[0])
                confidence = float(det.conf[0])
                x1, y1, x2, y2 = map(float, det.xyxy[0])
                class_name = model.names[class_id]
                f.write(f"{class_name} {confidence:.2f} {x1:.0f} {y1:.0f} {x2:.0f} {y2:.0f}\n")
        print(f"  Saved detections: {txt_path}")
    
    # Save annotated image
    output_image_path = output_dir / f"{source_path.stem}_detected.jpg"
    cv2.imwrite(str(output_image_path), annotated_frame)
    
    print(f"\n[OK] Image processing complete!")
    print(f"  Output image: {output_image_path}")
    print(f"  Saved to: {output_dir}")


def main():
    args = parse_args()
    
    # Auto-detect device if using default
    print(f"[*] Device specified: {args.device}")
    if args.device == "cpu":
        device = auto_detect_device()
        if device != "cpu":
            args.device = device
    
    print(f"[*] Using device: {args.device}")
    
    # Load model
    model = load_model(args.model, args.device, args.conf, args.iou)
    
    # Determine source type
    if str(args.source) == "0":
        print("\n" + "="*60)
        process_webcam(model, args)
    else:
        source_path = Path(args.source)
        
        # Check if file exists
        if not source_path.exists():
            print(f"ERROR: Source not found: {args.source}")
            return
        
        # Determine if video or image
        video_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv'}
        image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
        
        suffix = source_path.suffix.lower()
        
        print("\n" + "="*60)
        
        if suffix in video_extensions:
            process_video(model, args)
        elif suffix in image_extensions:
            process_image(model, args)
        else:
            print(f"ERROR: Unsupported file format: {suffix}")
            print(f"Supported formats: {video_extensions | image_extensions}")
            return


if __name__ == "__main__":
    main()

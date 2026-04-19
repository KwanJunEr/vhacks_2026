import cv2
import numpy as np
import argparse
import sys
import os
import time
import json
import tempfile
import subprocess
from collections import defaultdict
from pathlib import Path
from typing import cast, Union, Optional
from dotenv import load_dotenv
from inference_sdk import InferenceHTTPClient
from inference_sdk.webrtc import WebcamSource, StreamConfig, VideoMetadata, RTSPSource, VideoFileSource

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

ROBOFLOW_SERVER_URL = os.getenv("ROBOFLOW_SERVER_URL", "https://serverless.roboflow.com")
API_KEY = os.getenv("ROBOFLOW_API_KEY")
WORKSPACE = "rabbitmomo"
WORKFLOW = "detect-count-and-visualize"

if not API_KEY:
    print("ERROR: ROBOFLOW_API_KEY not found in .env file")
    sys.exit(1)


REPO_ROOT = Path(__file__).resolve().parent.parent


def initialize_client():
    """Initialize the Roboflow inference client."""
    try:
        client = InferenceHTTPClient.init(
            api_url=ROBOFLOW_SERVER_URL,
            api_key=API_KEY
        )
        print(f"[OK] Connected to Roboflow at {ROBOFLOW_SERVER_URL}")
        return client
    except Exception as e:
        print(f"ERROR: Failed to initialize client: {e}")
        sys.exit(1)


def resolve_video_path(source_value: str) -> Path:
    """Resolve video file path from either cwd or repository root."""
    source_path = Path(source_value)
    if source_path.exists():
        return source_path.resolve()

    candidate = REPO_ROOT / source_value
    if candidate.exists():
        return candidate.resolve()

    print(f"ERROR: Video file not found: {source_value}")
    print(f"Tried: {source_path.resolve()}")
    print(f"Tried: {candidate.resolve()}")
    sys.exit(1)


def probe_source_video_timing(video_path: Path):
    """Probe source video timing from the file itself.

    Returns a dictionary with:
    - frame_count: decoded frame count
    - duration_seconds: measured duration from timestamps when available
    - average_fps: frame_count / duration_seconds when duration is known
    - reported_fps: FPS reported by OpenCV metadata
    """
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        return {
            "frame_count": None,
            "duration_seconds": None,
            "average_fps": None,
            "reported_fps": None,
        }

    reported_fps = cap.get(cv2.CAP_PROP_FPS)
    reported_frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)

    decoded_frames = 0
    last_timestamp_msec = 0.0
    while True:
        ret, _ = cap.read()
        if not ret:
            break
        decoded_frames += 1
        timestamp_msec = cap.get(cv2.CAP_PROP_POS_MSEC)
        if timestamp_msec and timestamp_msec > last_timestamp_msec:
            last_timestamp_msec = timestamp_msec

    cap.release()

    duration_seconds = last_timestamp_msec / 1000.0 if last_timestamp_msec > 0 else None
    if duration_seconds and duration_seconds > 0:
        average_fps = decoded_frames / duration_seconds if decoded_frames else None
    elif reported_fps and reported_fps > 0 and reported_frame_count and reported_frame_count > 0:
        duration_seconds = float(reported_frame_count / reported_fps)
        average_fps = float(reported_fps)
    else:
        average_fps = None

    return {
        "frame_count": decoded_frames if decoded_frames else (int(reported_frame_count) if reported_frame_count else None),
        "duration_seconds": duration_seconds,
        "average_fps": average_fps,
        "reported_fps": float(reported_fps) if reported_fps and reported_fps > 0 else None,
    }


def create_mp4_writer(output_path: Path, width: int, height: int, fps: float):
    """Create video writer using FFmpeg subprocess (more reliable than OpenCV on Windows).
    
    Returns (process, codec, success, actual_path). Use process.stdin to write frames.
    Each frame should be a uint8 BGR image of the correct dimensions (width x height x 3).
    """
    
    if fps <= 0:
        fps = 30.0
    
    if width <= 0 or height <= 0:
        print(f"ERROR: Invalid video dimensions: {width}x{height}")
        return None, None, False, None

    actual_path = output_path.with_suffix('.mp4')
    
    ffmpeg_cmd = [
        'ffmpeg',
        '-y',
        '-f', 'rawvideo',
        '-pixel_format', 'bgr24',
        '-video_size', f'{width}x{height}',
        '-framerate', str(fps),
        '-i', 'pipe:0',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '23',
        str(actual_path)
    ]
    
    try:
        check = subprocess.run(['ffmpeg', '-version'], capture_output=True, timeout=5)
        if check.returncode != 0:
            print("[WARNING] FFmpeg not available")
            return None, None, False, None
        
        process = subprocess.Popen(
            ffmpeg_cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE
        )
        
        print(f"[INFO] Video writer: FFmpeg H.264/MP4, fps={fps:.2f}, size={width}x{height}")
        return process, "h264", True, actual_path
        
    except FileNotFoundError:
        print("[WARNING] FFmpeg not found - install via: choco install ffmpeg")
        return None, None, False, None
    except Exception as e:
        print(f"[WARNING] FFmpeg error: {e}")
        return None, None, False, None


def is_human_class(class_name: str) -> bool:
    normalized = class_name.lower()
    keywords = ["person", "human", "victim", "people"]
    return any(keyword in normalized for keyword in keywords)


def is_building_class(class_name: str) -> bool:
    normalized = class_name.lower()
    keywords = ["building", "collapsed", "collapse", "structure"]
    return any(keyword in normalized for keyword in keywords)


def is_vehicle_class(class_name: str) -> bool:
    normalized = class_name.lower()
    keywords = ["vehicle", "car", "truck", "bus", "van", "motorcycle", "bike"]
    return any(keyword in normalized for keyword in keywords)


def is_collapsed_building_class(class_name: str) -> bool:
    normalized = class_name.lower()
    return "collapsed building" in normalized or (
        ("collapsed" in normalized or "collapse" in normalized)
        and ("building" in normalized or "structure" in normalized)
    )


def extract_prediction_fields(pred):
    """Extract class/confidence/position from prediction-like objects."""
    x = None
    y = None
    width = None
    height = None

    if isinstance(pred, dict):
        class_name = pred.get("class") or pred.get("class_name") or pred.get("label") or "unknown"
        confidence = pred.get("confidence") or pred.get("conf") or pred.get("score") or 0
        x = pred.get("x")
        y = pred.get("y")
        width = pred.get("width")
        height = pred.get("height")
        return str(class_name), float(confidence or 0), x, y, width, height

    class_name_attr = getattr(pred, "class_name", None) or getattr(pred, "label", None) or getattr(pred, "class", None)
    confidence_attr = getattr(pred, "confidence", None) or getattr(pred, "conf", None) or getattr(pred, "score", None)
    x = getattr(pred, "x", None)
    y = getattr(pred, "y", None)
    width = getattr(pred, "width", None)
    height = getattr(pred, "height", None)
    if class_name_attr is not None:
        return str(class_name_attr), float(confidence_attr or 0), x, y, width, height

    return str(pred), 0.0, x, y, width, height


def extract_predictions_list(data: dict):
    """Normalize predictions payload into a flat list of prediction items."""
    raw_predictions = data.get("predictions")

    if isinstance(raw_predictions, list):
        return raw_predictions

    if isinstance(raw_predictions, dict):
        nested = raw_predictions.get("predictions")
        if isinstance(nested, list):
            return nested
        nested = raw_predictions.get("detections")
        if isinstance(nested, list):
            return nested

    # Some workflows emit detections at top-level under a different key.
    alt = data.get("detections")
    if isinstance(alt, list):
        return alt

    return []


def convert_to_video_space(value, axis_size: int):
    """Convert normalized or raw coordinate to pixel coordinate."""
    if value is None:
        return None
    v = float(value)
    if 0.0 <= v <= 1.0 and axis_size > 1:
        return v * axis_size
    return v


def build_pixel_bbox(x, y, width, height, frame_width, frame_height):
    """Build pixel-space center/size and corner coordinates for report."""
    if frame_width is None or frame_height is None:
        return {
            "x": None,
            "y": None,
            "width": None,
            "height": None,
            "x1": None,
            "y1": None,
            "x2": None,
            "y2": None,
        }

    x_px = convert_to_video_space(x, frame_width)
    y_px = convert_to_video_space(y, frame_height)
    w_px = convert_to_video_space(width, frame_width)
    h_px = convert_to_video_space(height, frame_height)

    if x_px is None or y_px is None or w_px is None or h_px is None:
        x1 = y1 = x2 = y2 = None
    else:
        x1 = x_px - (w_px / 2.0)
        y1 = y_px - (h_px / 2.0)
        x2 = x_px + (w_px / 2.0)
        y2 = y_px + (h_px / 2.0)

    return {
        "width": None if w_px is None else round(w_px, 3),
        "height": None if h_px is None else round(h_px, 3),
        "x1": None if x1 is None else round(x1, 3),
        "y1": None if y1 is None else round(y1, 3),
        "x2": None if x2 is None else round(x2, 3),
        "y2": None if y2 is None else round(y2, 3),
    }


def draw_predictions_on_frame(frame, predictions_list):
    """Draw prediction boxes and labels on a frame."""
    annotated_frame = frame.copy()
    frame_height, frame_width = frame.shape[:2]

    def get_class_color(name: str):
        normalized = name.lower()
        if is_collapsed_building_class(normalized):
            return (0, 0, 255)  # Red for collapsed building
        if is_human_class(normalized):
            return (128, 0, 128)  # Purple for people
        if is_vehicle_class(normalized):
            return (255, 0, 0)  # Blue for vehicle (BGR)
        return (255, 255, 255)  # White fallback

    for pred in predictions_list:
        class_name, confidence, x, y, width, height = extract_prediction_fields(pred)
        pixel_bbox = build_pixel_bbox(x, y, width, height, frame_width, frame_height)

        if None in (pixel_bbox["x1"], pixel_bbox["y1"], pixel_bbox["x2"], pixel_bbox["y2"]):
            continue

        x1_value = cast(float, pixel_bbox["x1"])
        y1_value = cast(float, pixel_bbox["y1"])
        x2_value = cast(float, pixel_bbox["x2"])
        y2_value = cast(float, pixel_bbox["y2"])

        x1 = int(max(0, min(frame_width - 1, x1_value)))
        y1 = int(max(0, min(frame_height - 1, y1_value)))
        x2 = int(max(0, min(frame_width - 1, x2_value)))
        y2 = int(max(0, min(frame_height - 1, y2_value)))

        box_color = get_class_color(class_name)
        cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), box_color, 2)
        label = f"{class_name} ({confidence:.2f})"

        (text_w, text_h), baseline = cv2.getTextSize(
            label,
            cv2.FONT_HERSHEY_SIMPLEX,
            0.75,
            2,
        )
        label_x1 = x1
        label_y2 = max(text_h + baseline + 6, y1)
        label_y1 = max(0, label_y2 - text_h - baseline - 6)
        label_x2 = min(frame_width - 1, x1 + text_w + 10)

        cv2.rectangle(
            annotated_frame,
            (label_x1, label_y1),
            (label_x2, label_y2),
            box_color,
            -1,
        )
        cv2.putText(
            annotated_frame,
            label,
            (label_x1 + 5, label_y2 - baseline - 3),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.75,
            (255, 255, 255),
            2,
            cv2.LINE_AA,
        )

    return annotated_frame


def process_video_frame_by_frame(client, args, source_path: Path, model_id: str, source_video_timing: dict):
    """Process a video frame-by-frame like detect_victims."""
    print("[INFO] Frame-by-frame video processing enabled")
    print(f"[INFO] Model ID: {model_id}")

    cap = cv2.VideoCapture(str(source_path))
    if not cap.isOpened():
        print(f"ERROR: Cannot open video: {source_path}")
        sys.exit(1)

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or None

    writer_fps = (
        source_video_timing.get("average_fps")
        or source_video_timing.get("reported_fps")
        or 30.0
    )

    print(f"[INFO] Source size: {width}x{height}")
    if source_video_timing.get("duration_seconds"):
        print(f"[INFO] Source duration: {source_video_timing['duration_seconds']:.2f} sec")
    if total_frames:
        print(f"[INFO] Source frames: {total_frames}")
    print(f"[INFO] Output FPS: {writer_fps:.2f}")

    output_dir = Path(args.output_dir)
    if not output_dir.is_absolute():
        output_dir = (REPO_ROOT / output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = int(time.time() * 1000)
    output_video_path = output_dir / f"collapsed_building_{timestamp}.mp4"
    report_json_path = output_dir / f"collapsed_building_report_{timestamp}.json"

    writer, codec, success, actual_output_path = create_mp4_writer(output_video_path, width, height, writer_fps)
    if not success or writer is None:
        print(f"ERROR: Failed to initialize video writer: {output_video_path}")
        cap.release()
        sys.exit(1)
    
    output_video_path = actual_output_path  # Update to actual path in case format changed

    temp_frame_path = Path(tempfile.gettempdir()) / f"collapsed_building_frame_{timestamp}.jpg"

    frame_reports = []
    class_counts = defaultdict(int)
    class_conf_sum = defaultdict(float)
    human_total = 0
    building_total = 0
    detections_total = 0
    frame_count = 0
    analyzed_started_at = time.time()

    print("[INFO] Processing frames...")

    try:
        frame_idx = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1

            frame_h, frame_w = frame.shape[:2]
            if frame_w != width or frame_h != height:
                print(f"[WARNING] Frame {frame_count} dimension mismatch: expected {width}x{height}, got {frame_w}x{frame_h}")
                frame = cv2.resize(frame, (width, height), interpolation=cv2.INTER_LINEAR)

            if frame.dtype != np.uint8:
                frame = frame.astype(np.uint8)

            frame = np.ascontiguousarray(frame)
            
            cv2.imwrite(str(temp_frame_path), frame)

            try:
                result = client.infer(str(temp_frame_path), model_id=model_id)
                predictions_list = extract_predictions_list(result if isinstance(result, dict) else {"predictions": result})
            except Exception as e:
                print(f"[WARNING] Inference error on frame {frame_count}: {e}")
                predictions_list = []

            frame_details = []
            frame_people_count = 0
            frame_vehicle_count = 0
            frame_collapsed_building_count = 0

            for pred in predictions_list:
                class_name, confidence, x, y, width_box, height_box = extract_prediction_fields(pred)
                class_counts[class_name] += 1
                class_conf_sum[class_name] += confidence
                detections_total += 1

                if is_human_class(class_name):
                    human_total += 1
                    frame_people_count += 1
                if is_vehicle_class(class_name):
                    frame_vehicle_count += 1
                if is_collapsed_building_class(class_name):
                    building_total += 1
                    frame_collapsed_building_count += 1

                pixel_bbox = build_pixel_bbox(x, y, width_box, height_box, width, height)
                frame_details.append({
                    "class": class_name,
                    "confidence": round(confidence, 6),
                    "coordinate_space": "video_pixels",
                    "width": pixel_bbox["width"],
                    "height": pixel_bbox["height"],
                    "x1": pixel_bbox["x1"],
                    "y1": pixel_bbox["y1"],
                    "x2": pixel_bbox["x2"],
                    "y2": pixel_bbox["y2"],
                })

            annotated_frame = draw_predictions_on_frame(frame, predictions_list)

            if annotated_frame is None:
                print(f"[WARNING] Frame {frame_count} is None, skipping")
                continue
                
            annotated_h, annotated_w = annotated_frame.shape[:2]
            if annotated_w != width or annotated_h != height:
                print(f"[WARNING] Annotated frame {frame_count} has wrong dimensions: {annotated_w}x{annotated_h}, resizing")
                annotated_frame = cv2.resize(annotated_frame, (width, height), interpolation=cv2.INTER_LINEAR)

            annotated_frame = np.ascontiguousarray(annotated_frame)

            count_text = f"People: {frame_people_count} Vehicle: {frame_vehicle_count} Collapsed Building: {frame_collapsed_building_count}"
            text_x = 15
            text_y = 75
            (text_width, text_height), baseline = cv2.getTextSize(count_text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
            cv2.rectangle(
                annotated_frame,
                (text_x - 8, text_y - text_height - 10),
                (text_x + text_width + 8, text_y + baseline + 6),
                (0, 128, 0),
                thickness=-1,
            )
            cv2.putText(
                annotated_frame,
                count_text,
                (text_x, text_y),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )

            write_success = True
            writer_stdin = getattr(writer, 'stdin', None)
            if writer_stdin is not None:
                try:
                    writer_stdin.write(annotated_frame.tobytes())
                except Exception as e:
                    print(f"[ERROR] Failed to write frame {frame_count} to FFmpeg: {e}")
                    write_success = False
            else:
                print("[ERROR] Unsupported video writer backend; FFmpeg is required")
                write_success = False
            
            if not write_success:
                print(f"[ERROR] Failed to write frame {frame_count}")
                break
            elif frame_count % 25 == 0:
                print(f"[OK] Wrote frame {frame_count}/{total_frames if total_frames else '?'}")

            frame_reports.append({
                "frame_id": frame_count,
                "prediction_count": len(frame_details),
                "category_counts": {
                    "people": frame_people_count,
                    "vehicle": frame_vehicle_count,
                    "collapsed_building": frame_collapsed_building_count,
                },
                "predictions": frame_details,
            })

    finally:
        cap.release()

        writer_stdin = getattr(writer, 'stdin', None)
        if writer_stdin is not None:
            try:
                writer_stdin.close()
                writer.wait(timeout=5)
            except Exception as e:
                print(f"[WARNING] Error closing FFmpeg process: {e}")
                try:
                    writer.kill()
                except:
                    pass
        
        print("[INFO] Video processing finalized and writer released")

    class_summary = []
    for class_name in sorted(class_counts.keys()):
        count = class_counts[class_name]
        avg_conf = class_conf_sum[class_name] / count if count else 0
        class_summary.append({
            "class": class_name,
            "count": count,
            "avg_confidence": round(avg_conf, 6)
        })

    finished_at = time.time()
    report_payload = {
        "workflow": WORKFLOW,
        "workspace": WORKSPACE,
        "processing_mode": "frame_by_frame",
        "source_type": args.source_type,
        "source": str(source_path),
        "model_id": model_id,
        "requested_output_fps": args.output_fps,
        "source_video_reported_fps": source_video_timing.get("reported_fps"),
        "source_video_frame_count": source_video_timing.get("frame_count"),
        "source_video_duration_seconds": source_video_timing.get("duration_seconds"),
        "source_video_average_fps": source_video_timing.get("average_fps"),
        "effective_output_fps": writer_fps,
        "video_codec": codec,
        "analysis_started_unix": analyzed_started_at,
        "analysis_finished_unix": finished_at,
        "analysis_duration_seconds": round(finished_at - analyzed_started_at, 3),
        "total_frames_processed": frame_count,
        "total_detections": detections_total,
        "human_detections": human_total,
        "building_detections": building_total,
        "class_summary": class_summary,
        "frame_reports": frame_reports,
        "saved_video_path": str(output_video_path),
    }

    with open(report_json_path, "w", encoding="utf-8") as f:
        json.dump(report_payload, f, indent=2)

    print(f"\n[OK] Video processing complete!")
    print(f"  Frames processed: {frame_count}/{total_frames if total_frames else frame_count}")
    print(f"  Total detections: {detections_total}")
    print(f"  Saved analyzed video: {output_video_path}")
    print(f"  Saved analysis report JSON: {report_json_path}")
    print(f"  MP4 codec: {codec}")


def get_video_source(source_type, source_value):
    """Create appropriate video source based on type."""
    try:
        if source_type == "webcam":
            source_id = int(source_value) if source_value.isdigit() else 0
            print(f"[OK] Webcam source initialized (device {source_id})")
            return WebcamSource(resolution=(1280, 720))
        
        elif source_type == "rtsp":
            print(f"[OK] RTSP source initialized: {source_value}")
            return RTSPSource(url=source_value)
        
        elif source_type == "video":
            resolved_source = str(resolve_video_path(source_value))
            print(f"[OK] Video file source initialized: {resolved_source}")
            return VideoFileSource(path=resolved_source, realtime_processing=True)
        
        else:
            print(f"ERROR: Unknown source type: {source_type}")
            sys.exit(1)
    except Exception as e:
        print(f"ERROR: Failed to initialize video source: {e}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Real-time collapsed building detection via WebRTC streaming"
    )
    parser.add_argument(
        "--source",
        type=str,
        default="0",
        help="Video source: webcam ID (e.g., 0), RTSP URL, or video file path"
    )
    parser.add_argument(
        "--source-type",
        type=str,
        choices=["webcam", "rtsp", "video"],
        default="webcam",
        help="Type of video source"
    )
    parser.add_argument(
        "--plan",
        type=str,
        choices=["webrtc-gpu-small", "webrtc-gpu-medium", "webrtc-gpu-large"],
        default="webrtc-gpu-medium",
        help="GPU computing plan"
    )
    parser.add_argument(
        "--region",
        type=str,
        choices=["us", "eu", "ap"],
        default="us",
        help="Server region"
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=3600,
        help="Processing timeout in seconds"
    )
    parser.add_argument(
        "--model-id",
        type=str,
        default=os.getenv("ROBOFLOW_COLLAPSED_MODEL_ID"),
        help="Roboflow model id for frame-by-frame video processing"
    )
    parser.add_argument(
        "--save-output",
        action="store_true",
        help="Save annotated output video to disk"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="disaster_command/public/analyzed_videos",
        help="Directory to save analyzed videos"
    )
    parser.add_argument(
        "--output-fps",
        type=float,
        default=0.0,
        help="FPS for saved analyzed video (0 uses source video FPS)"
    )

    args = parser.parse_args()

    print("\n" + "="*60)
    print("  COLLAPSED BUILDING DETECTION - WebRTC Stream")
    print("="*60)
    print(f"Source: {args.source}")
    print(f"Source Type: {args.source_type}")
    print(f"GPU Plan: {args.plan}")
    print(f"Region: {args.region}")
    print(f"Requested Output FPS: {args.output_fps}")
    if args.model_id:
        print(f"Model ID: {args.model_id}")
    print("="*60 + "\n")

    resolved_source_path = None
    source_video_timing = None
    if args.source_type == "video":
        resolved_source_path = resolve_video_path(args.source)
        source_video_timing = probe_source_video_timing(resolved_source_path)

    effective_output_fps = args.output_fps
    if effective_output_fps <= 0:
        effective_output_fps = (
            source_video_timing["average_fps"]
            if source_video_timing and source_video_timing["average_fps"]
            else 30.0
        )

    if source_video_timing:
        if source_video_timing["reported_fps"]:
            print(f"Source reported FPS: {source_video_timing['reported_fps']:.2f}")
        if source_video_timing["duration_seconds"]:
            print(f"Source duration: {source_video_timing['duration_seconds']:.2f} sec")
        if source_video_timing["frame_count"]:
            print(f"Source frame count: {source_video_timing['frame_count']}")
    print(f"Effective output FPS: {effective_output_fps:.2f}")

    client = initialize_client()

    if args.source_type == "video" and args.model_id:
        video_source_path: Path = resolved_source_path if resolved_source_path is not None else resolve_video_path(args.source)
        process_video_frame_by_frame(client, args, video_source_path, args.model_id, source_video_timing or {})
        return

    source = get_video_source(args.source_type, args.source)

    config = StreamConfig(
        stream_output=["output_image"],
        data_output=["count_objects", "predictions"],
        processing_timeout=args.timeout,
        requested_plan=args.plan,
        requested_region=args.region
    )

    print("Starting WebRTC stream session...")
    print("Press 'q' to quit streaming\n")

    try:
        session = client.webrtc.stream(
            source=source,
            workflow=WORKFLOW,
            workspace=WORKSPACE,
            image_input="image",
            config=config
        )
    except Exception as e:
        print(f"ERROR: Failed to create streaming session: {e}")
        sys.exit(1)

    frame_count = 0
    detections_total = 0
    output_video_path = None
    report_json_path = None
    frame_reports = []
    annotated_frames = []
    class_counts = defaultdict(int)
    class_conf_sum = defaultdict(float)
    human_total = 0
    building_total = 0
    analyzed_started_at = time.time()
    latest_frame_width = None
    latest_frame_height = None

    should_save_output = args.save_output or args.source_type == "video"
    if should_save_output:
        output_dir = Path(args.output_dir)
        if not output_dir.is_absolute():
            output_dir = (REPO_ROOT / output_dir).resolve()
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = int(time.time() * 1000)
        output_video_path = output_dir / f"collapsed_building_{timestamp}.mp4"
        report_json_path = output_dir / f"collapsed_building_report_{timestamp}.json"
        print(f"Annotated video will be saved to: {output_video_path}")
        print(f"Analysis report will be saved to: {report_json_path}")

    @session.on_frame
    def show_frame(frame, metadata):
        nonlocal frame_count, latest_frame_width, latest_frame_height
        frame_count += 1
        latest_frame_height, latest_frame_width = frame.shape[:2]
        
        if should_save_output:
            annotated_frames.append(frame.copy())

    @session.on_data()
    def on_data(data: dict, metadata: VideoMetadata):
        nonlocal detections_total, human_total, building_total

        predictions_list = extract_predictions_list(data)
        if predictions_list:
            num_predictions = len(predictions_list)
            detections_total += num_predictions
            frame_details = []
            frame_people_count = 0
            frame_vehicle_count = 0
            frame_collapsed_building_count = 0
            
            print(f"Frame {metadata.frame_id}: {num_predictions} collapsed building detection(s)")
            
            for i, pred in enumerate(predictions_list, 1):
                class_name, confidence, x, y, width, height = extract_prediction_fields(pred)
                pixel_bbox = build_pixel_bbox(
                    x,
                    y,
                    width,
                    height,
                    latest_frame_width,
                    latest_frame_height,
                )
                class_counts[class_name] += 1
                class_conf_sum[class_name] += confidence
                if is_human_class(class_name):
                    human_total += 1
                    frame_people_count += 1
                if is_building_class(class_name):
                    building_total += 1
                if is_vehicle_class(class_name):
                    frame_vehicle_count += 1
                if is_collapsed_building_class(class_name):
                    frame_collapsed_building_count += 1

                frame_details.append({
                    "class": class_name,
                    "confidence": round(confidence, 6),
                    "coordinate_space": "video_pixels",
                    "width": pixel_bbox["width"],
                    "height": pixel_bbox["height"],
                    "x1": pixel_bbox["x1"],
                    "y1": pixel_bbox["y1"],
                    "x2": pixel_bbox["x2"],
                    "y2": pixel_bbox["y2"],
                })
                print(
                    f"  [{i}] {class_name} "
                    f"(confidence: {confidence:.2f}, x: {pixel_bbox['x']}, y: {pixel_bbox['y']})"
                )

            frame_reports.append({
                "frame_id": int(getattr(metadata, "frame_id", frame_count)),
                "prediction_count": num_predictions,
                "category_counts": {
                    "people": frame_people_count,
                    "vehicle": frame_vehicle_count,
                    "collapsed_building": frame_collapsed_building_count
                },
                "predictions": frame_details
            })

    try:
        session.run()
    except KeyboardInterrupt:
        print("\nStream interrupted by user")
    except Exception as e:
        print(f"ERROR: Stream error: {e}")
    finally:
        finished_at = time.time()
        print(f"\nStream session closed.")
        print(f"Total frames processed: {frame_count}")
        print(f"Total detections: {detections_total}")
        print(f"Human detections (class keyword match): {human_total}")
        print(f"Building detections (class keyword match): {building_total}")
        if output_video_path is not None and frame_count > 0:
            print(f"Saved analyzed video: {output_video_path}")

        class_summary = []
        for class_name in sorted(class_counts.keys()):
            count = class_counts[class_name]
            avg_conf = class_conf_sum[class_name] / count if count else 0
            class_summary.append({
                "class": class_name,
                "count": count,
                "avg_confidence": round(avg_conf, 6)
            })

        report_payload = {
            "workflow": WORKFLOW,
            "workspace": WORKSPACE,
            "source_type": args.source_type,
            "source": str(resolved_source_path) if resolved_source_path else args.source,
            "requested_output_fps": args.output_fps,
            "source_video_reported_fps": source_video_timing["reported_fps"] if source_video_timing else None,
            "source_video_frame_count": source_video_timing["frame_count"] if source_video_timing else None,
            "source_video_duration_seconds": source_video_timing["duration_seconds"] if source_video_timing else None,
            "source_video_average_fps": source_video_timing["average_fps"] if source_video_timing else None,
            "effective_output_fps": effective_output_fps,
            "video_codec": None,
            "analysis_started_unix": analyzed_started_at,
            "analysis_finished_unix": finished_at,
            "analysis_duration_seconds": round(finished_at - analyzed_started_at, 3),
            "total_frames_processed": frame_count,
            "total_detections": detections_total,
            "human_detections": human_total,
            "building_detections": building_total,
            "class_summary": class_summary,
            "frame_reports": frame_reports,
            "saved_video_path": str(output_video_path) if output_video_path else None
        }

        if report_json_path is not None:
            with open(report_json_path, "w", encoding="utf-8") as f:
                json.dump(report_payload, f, indent=2)
            print(f"Saved analysis report JSON: {report_json_path}")

        if should_save_output and annotated_frames and output_video_path is not None:
            frame_height, frame_width = annotated_frames[0].shape[:2]
            target_frame_count = None
            if source_video_timing and source_video_timing["frame_count"]:
                target_frame_count = int(source_video_timing["frame_count"])
            if not target_frame_count or target_frame_count <= 0:
                target_frame_count = len(annotated_frames)

            writer_fps = effective_output_fps
            writer, codec, success, actual_path = create_mp4_writer(output_video_path, frame_width, frame_height, writer_fps)
            if not success or writer is None:
                print(f"ERROR: Failed to open video writer: {output_video_path}")
            else:
                if actual_path and actual_path != output_video_path:
                    output_video_path = actual_path
                    print(f"[INFO] Output format changed to: {output_video_path}")
                
                try:
                    for output_index in range(target_frame_count):
                        if len(annotated_frames) == 1 or target_frame_count == 1:
                            source_index = 0
                        else:
                            source_index = round(
                                output_index * (len(annotated_frames) - 1) / (target_frame_count - 1)
                            )
                        
                        frame_data = annotated_frames[source_index]
                        write_success = False

                        writer_stdin = getattr(writer, 'stdin', None)
                        if writer_stdin is not None:
                            try:
                                writer_stdin.write(frame_data.tobytes())
                                write_success = True
                            except Exception as e:
                                print(f"[WARNING] Failed to write frame {output_index} to FFmpeg: {e}")
                        else:
                            print("[WARNING] Unsupported video writer backend; skipping frame write")
                        
                        if not write_success:
                            print(f"[WARNING] Failed to write frame {output_index} to video")
                finally:
                    writer_stdin = getattr(writer, 'stdin', None)
                    if writer_stdin is not None:
                        try:
                            writer_stdin.close()
                            writer.wait(timeout=5)
                        except Exception as e:
                            print(f"[WARNING] FFmpeg cleanup error: {e}")
                            try:
                                writer.kill()
                            except:
                                pass
                    
                    print(f"[OK] Using codec: {codec}")
                    print(f"[OK] Saved analyzed video ({target_frame_count} frames): {output_video_path}")
        print("="*60 + "\n")


if __name__ == "__main__":
    main()

import cv2
import argparse
import sys
import os
from pathlib import Path
from dotenv import load_dotenv
from inference_sdk import InferenceHTTPClient
from inference_sdk.webrtc import WebcamSource, StreamConfig, VideoMetadata, RTSPSource, VideoFileSource

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Get API credentials from environment
ROBOFLOW_SERVER_URL = os.getenv("ROBOFLOW_SERVER_URL", "https://serverless.roboflow.com")
API_KEY = os.getenv("ROBOFLOW_API_KEY")
WORKSPACE = "rabbitmomo"
WORKFLOW = "detect-count-and-visualize"

if not API_KEY:
    print("ERROR: ROBOFLOW_API_KEY not found in .env file")
    sys.exit(1)


def initialize_client():
    """Initialize the Roboflow inference client."""
    try:
        client = InferenceHTTPClient.init(
            api_url=ROBOFLOW_SERVER_URL,
            api_key=API_KEY
        )
        print(f"✓ Connected to Roboflow at {ROBOFLOW_SERVER_URL}")
        return client
    except Exception as e:
        print(f"ERROR: Failed to initialize client: {e}")
        sys.exit(1)


def get_video_source(source_type, source_value):
    """Create appropriate video source based on type."""
    try:
        if source_type == "webcam":
            source_id = int(source_value) if source_value.isdigit() else 0
            print(f"✓ Webcam source initialized (device {source_id})")
            return WebcamSource(resolution=(1280, 720))
        
        elif source_type == "rtsp":
            print(f"✓ RTSP source initialized: {source_value}")
            return RTSPSource(url=source_value)
        
        elif source_type == "video":
            if not os.path.exists(source_value):
                print(f"ERROR: Video file not found: {source_value}")
                sys.exit(1)
            print(f"✓ Video file source initialized: {source_value}")
            return VideoFileSource(file_path=source_value)
        
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

    args = parser.parse_args()

    print("\n" + "="*60)
    print("  COLLAPSED BUILDING DETECTION - WebRTC Stream")
    print("="*60)
    print(f"Source: {args.source}")
    print(f"Source Type: {args.source_type}")
    print(f"GPU Plan: {args.plan}")
    print(f"Region: {args.region}")
    print("="*60 + "\n")

    # Initialize client
    client = initialize_client()

    # Get video source
    source = get_video_source(args.source_type, args.source)

    # Configure streaming options
    config = StreamConfig(
        stream_output=["output_image"],           # Get video back with annotations
        data_output=["count_objects", "predictions"],  # Get prediction data
        processing_timeout=args.timeout,           # Timeout in seconds
        requested_plan=args.plan,                   # GPU plan
        requested_region=args.region                # Region
    )

    print("Starting WebRTC stream session...")
    print("Press 'q' to quit streaming\n")

    # Create streaming session
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

    # Handle incoming video frames with annotations
    @session.on_frame
    def show_frame(frame, metadata):
        nonlocal frame_count
        frame_count += 1
        
        # Display frame counter and instructions
        cv2.putText(
            frame, 
            f"Frame: {frame_count}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )
        cv2.putText(
            frame,
            "Press 'q' to quit",
            (10, 70),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (200, 200, 200),
            1
        )
        
        cv2.imshow("Collapsed Building Detection", frame)
        
        # Exit on 'q' key
        if cv2.waitKey(1) & 0xFF == ord("q"):
            print("\nClosing stream...")
            session.close()

    # Handle prediction data via datachannel
    @session.on_data()
    def on_data(data: dict, metadata: VideoMetadata):
        nonlocal detections_total
        
        # Extract prediction info
        if "predictions" in data and data["predictions"]:
            num_predictions = len(data["predictions"])
            detections_total += num_predictions
            
            print(f"Frame {metadata.frame_id}: {num_predictions} collapsed building detection(s)")
            
            # Print detailed predictions
            for i, pred in enumerate(data["predictions"], 1):
                if isinstance(pred, dict):
                    class_name = pred.get("class", "unknown")
                    confidence = pred.get("confidence", 0)
                    print(f"  [{i}] {class_name} (confidence: {confidence:.2f})")

    # Run the session
    try:
        session.run()
    except KeyboardInterrupt:
        print("\nStream interrupted by user")
    except Exception as e:
        print(f"ERROR: Stream error: {e}")
    finally:
        cv2.destroyAllWindows()
        print(f"\nStream session closed.")
        print(f"Total frames processed: {frame_count}")
        print(f"Total detections: {detections_total}")
        print("="*60 + "\n")


if __name__ == "__main__":
    main()

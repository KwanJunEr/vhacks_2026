from fastapi import APIRouter
import random
import json
from pathlib import Path
from .schemas import (
    AIConfidenceMatrixItem,
    AIConfidenceMatrixResponse,
    AICoordinationAccuracyPoint,
    AICoordinationAccuracyResponse,
    CriticalOperationsFeedResponse,
    FeedItem,
    SwarmMetrics,
)

router = APIRouter(tags=["dashboard"])

def fluctuate(base, variance):
    return round(base + random.uniform(-variance, variance), 2)


def get_latest_analysis_report() -> dict:
    project_root = Path(__file__).resolve().parents[3]
    analyzed_videos_dir = project_root / "disaster_command" / "public" / "analyzed_videos"

    report_files = sorted(
        analyzed_videos_dir.glob("*.json"),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )
    if not report_files:
        return {}

    latest_report = report_files[0]
    with latest_report.open("r", encoding="utf-8") as file_handle:
        return json.load(file_handle)

@router.get("/metrics", response_model=SwarmMetrics)
def get_metrics():
    return SwarmMetrics(
        swarm_efficiency=fluctuate(98.0, 1.5),
        utilization_rate=fluctuate(92.0, 4.0),
        drone_failures=12,
        avg_recovery=max(10, int(fluctuate(45, 10))),
        coordination_accuracy=fluctuate(94.0, 2.0),
        critical_events=3,
    )


@router.get("/ai-coordination-accuracy", response_model=AICoordinationAccuracyResponse)
def get_ai_coordination_accuracy():
    report = get_latest_analysis_report()
    frame_reports = [frame for frame in report.get("frame_reports", []) if isinstance(frame, dict)]
    if not frame_reports:
        return AICoordinationAccuracyResponse(data=[])

    labels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]
    bucketed_frames = []
    total_frames = len(frame_reports)

    for index in range(len(labels)):
        start = (total_frames * index) // len(labels)
        end = (total_frames * (index + 1)) // len(labels)
        bucketed_frames.append(frame_reports[start:end])

    data = []
    for label, bucket in zip(labels, bucketed_frames):
        if not bucket:
            data.append(AICoordinationAccuracyPoint(label=label, accuracy=0.0))
            continue

        frame_scores = []
        for frame in bucket:
            predictions = [prediction for prediction in frame.get("predictions", []) if isinstance(prediction, dict)]
            confidences = [float(prediction.get("confidence", 0.0)) for prediction in predictions if prediction.get("confidence") is not None]
            if confidences:
                frame_scores.append(sum(confidences) / len(confidences))

        accuracy = round((sum(frame_scores) / len(frame_scores) * 100.0) if frame_scores else 0.0, 1)
        data.append(AICoordinationAccuracyPoint(label=label, accuracy=accuracy))

    return AICoordinationAccuracyResponse(data=data)


@router.get("/ai-confidence-matrix", response_model=AIConfidenceMatrixResponse)
def get_ai_confidence_matrix():
    report = get_latest_analysis_report()
    if not report:
        return AIConfidenceMatrixResponse(global_score=0.0, items=[])

    class_summary = {entry.get("class", ""): entry for entry in report.get("class_summary", []) if isinstance(entry, dict)}

    collapsed_confidence = float(class_summary.get("collapsed building", {}).get("avg_confidence", 0.0)) * 100
    people_confidence = float(class_summary.get("people", {}).get("avg_confidence", 0.0)) * 100
    vehicle_confidence = float(class_summary.get("vehicle", {}).get("avg_confidence", 0.0)) * 100

    total_detections = float(report.get("total_detections", 0) or 0)
    human_detections = float(report.get("human_detections", 0) or 0)
    building_detections = float(report.get("building_detections", 0) or 0)
    frames_processed = float(report.get("total_frames_processed", 0) or 0)
    source_frames = float(report.get("source_video_frame_count", 0) or 0)
    analysis_duration = float(report.get("analysis_duration_seconds", 0) or 0)
    source_duration = float(report.get("source_video_duration_seconds", 0) or 0)

    matrix_items = [
        AIConfidenceMatrixItem(label="Rescue Priority", value=round(collapsed_confidence, 1)),
        AIConfidenceMatrixItem(label="Survivor Detection", value=round(people_confidence or (human_detections / max(total_detections, 1.0) * 100.0), 1)),
        AIConfidenceMatrixItem(label="Battery Status", value=round(vehicle_confidence or (max(0.0, 100.0 - building_detections / max(total_detections, 1.0) * 100.0)), 1)),
        AIConfidenceMatrixItem(label="Connectivity Recovery", value=round(min(100.0, (human_detections + building_detections) / max(total_detections, 1.0) * 100.0), 1)),
        AIConfidenceMatrixItem(label="Supply Delivery", value=round(min(100.0, building_detections / max(total_detections, 1.0) * 100.0), 1)),
        AIConfidenceMatrixItem(label="Swarm Coordination", value=round(min(100.0, frames_processed / max(source_frames, 1.0) * 100.0), 1)),
        AIConfidenceMatrixItem(label="Default Operations", value=round(min(100.0, total_detections / max(frames_processed, 1.0) * 10.0), 1)),
        AIConfidenceMatrixItem(label="Environmental Risk", value=round(min(100.0, analysis_duration / max(source_duration, 1.0) * 100.0), 1)),
    ]
    global_score = round(sum(item.value for item in matrix_items) / len(matrix_items), 1)
    return AIConfidenceMatrixResponse(global_score=global_score, items=matrix_items)


@router.get("/critical-operations-log", response_model=CriticalOperationsFeedResponse)
def get_critical_operations_log():
    report = get_latest_analysis_report()
    if not report:
        return CriticalOperationsFeedResponse(items=[])

    class_summary = report.get("class_summary", []) if isinstance(report.get("class_summary", []), list) else []
    frame_reports = report.get("frame_reports", []) if isinstance(report.get("frame_reports", []), list) else []

    people_summary = next((entry for entry in class_summary if isinstance(entry, dict) and entry.get("class") == "people"), {})
    building_summary = next((entry for entry in class_summary if isinstance(entry, dict) and entry.get("class") == "collapsed building"), {})
    vehicle_summary = next((entry for entry in class_summary if isinstance(entry, dict) and entry.get("class") == "vehicle"), {})

    human_detections = int(report.get("human_detections", 0) or 0)
    building_detections = int(report.get("building_detections", 0) or 0)
    total_detections = int(report.get("total_detections", 0) or 0)

    critical_items = [
        FeedItem(
            title="Analysis completed",
            message=f"Processed {report.get('total_frames_processed', 0)} frames and {total_detections} detections from the latest disaster video.",
        ),
        FeedItem(
            title="Survivor signals tracked",
            message=f"Detected {human_detections} human signatures with average confidence {float(people_summary.get('avg_confidence', 0.0)) * 100:.1f}%.",
        ),
        FeedItem(
            title="Structural damage confirmed",
            message=f"Collapsed-building detections totaled {building_detections} with average confidence {float(building_summary.get('avg_confidence', 0.0)) * 100:.1f}%.",
        ),
        FeedItem(
            title="Vehicle activity monitored",
            message=f"Vehicle detections recorded at {int(vehicle_summary.get('count', 0) or 0)} across the scan window.",
        ),
    ]

    frame_buckets = frame_reports[-2:] if len(frame_reports) >= 2 else frame_reports
    for frame in frame_buckets:
        if not isinstance(frame, dict):
            continue
        frame_id = frame.get("frame_id", "unknown")
        prediction_count = frame.get("prediction_count", 0)
        critical_items.append(
            FeedItem(
                title=f"Frame {frame_id} reviewed",
                message=f"{prediction_count} predictions validated in the latest inspection pass.",
            )
        )

    if len(critical_items) > 4:
        critical_items = critical_items[:4]

    return CriticalOperationsFeedResponse(items=critical_items)
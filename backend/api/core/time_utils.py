from __future__ import annotations

import re
from datetime import datetime, time, timedelta, timezone


DEFAULT_FEED_DAY = 24
DEFAULT_FEED_TIME = time(0, 0, tzinfo=timezone.utc)

_RELATIVE_TIMESTAMP_PATTERN = re.compile(
    r"^(?P<value>\d+)\s*(?P<unit>sec|secs|second|seconds|min|mins|minute|minutes|hour|hours|day|days)\s+ago$",
    re.IGNORECASE,
)


def get_latest_timestamp() -> str:
    """Return the current absolute timestamp in UTC."""
    return datetime.now(timezone.utc).isoformat()


def get_default_timestamp() -> str:
    """Return the fallback timestamp for the 24th of the current month in UTC."""
    now = datetime.now(timezone.utc)
    fallback_timestamp = datetime(
        now.year,
        now.month,
        DEFAULT_FEED_DAY,
        DEFAULT_FEED_TIME.hour,
        DEFAULT_FEED_TIME.minute,
        DEFAULT_FEED_TIME.second,
        tzinfo=timezone.utc,
    )
    return fallback_timestamp.isoformat()


def normalize_feed_timestamp(timestamp: str | None) -> str:
    """Convert relative timestamps to absolute UTC timestamps.

    If the input is missing, the fallback timestamp is used instead.
    """
    if not timestamp:
        return get_default_timestamp()

    relative_timestamp = _relative_timestamp_to_absolute(timestamp)
    if relative_timestamp is not None:
        return relative_timestamp

    absolute_timestamp = _absolute_timestamp_to_iso(timestamp)
    if absolute_timestamp is not None:
        return absolute_timestamp

    return timestamp


def _relative_timestamp_to_absolute(timestamp: str) -> str | None:
    match = _RELATIVE_TIMESTAMP_PATTERN.match(timestamp.strip())
    if not match:
        return None

    value = int(match.group("value"))
    unit = match.group("unit").lower()

    if unit.startswith("sec"):
        delta = timedelta(seconds=value)
    elif unit.startswith("min"):
        delta = timedelta(minutes=value)
    elif unit.startswith("hour"):
        delta = timedelta(hours=value)
    else:
        delta = timedelta(days=value)

    absolute_timestamp = datetime.now(timezone.utc) - delta
    return absolute_timestamp.isoformat()


def _absolute_timestamp_to_iso(timestamp: str) -> str | None:
    try:
        parsed_timestamp = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
    except ValueError:
        return None

    if parsed_timestamp.tzinfo is None:
        parsed_timestamp = parsed_timestamp.replace(tzinfo=timezone.utc)

    return parsed_timestamp.astimezone(timezone.utc).isoformat()
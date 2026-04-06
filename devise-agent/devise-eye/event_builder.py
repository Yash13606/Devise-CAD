"""Event builder module for Devise Desktop Agent."""

import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Optional, Any


logger = logging.getLogger(__name__)


class EventBuilder:
    """Builds event objects matching required schema."""

    REQUIRED_FIELDS = [
        "org_id",
        "device_id",
        "tool_name",
        "domain",
        "category",
        "vendor",
        "risk_level",
        "event_type",
        "process_name",
        "process_path",
        "is_approved",
        "is_blocked",
        "sensitivity_score",
        "timestamp",
    ]

    def __init__(self, identity: Dict[str, str], device_id: str, org_id: str):
        """Initialize event builder.

        Args:
            identity: User identity dict from identity module
            device_id: Device ID from config
            org_id: Organization ID from config
        """
        self._identity = identity
        self._device_id = device_id
        self._org_id = org_id

    def build_event(
        self,
        tool_name: str,
        domain: str,
        category: str,
        vendor: str,
        risk_level: str,
        process_name: str = "unknown",
        process_path: str = "",
        is_approved: bool = False,
        is_blocked: bool = False,
        sensitivity_score: int = 0,
        connection_frequency: Optional[int] = None,
        high_frequency: Optional[bool] = None,
        bytes_read: Optional[int] = None,
        bytes_write: Optional[int] = None,
        block_reason: Optional[str] = None,
        policy_matched: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Build event object with required schema.

        Args:
            tool_name: Name of the AI tool
            domain: Domain of the tool
            category: Tool category
            vendor: Tool vendor
            risk_level: Risk level (low/medium/high)
            process_name: Process name (default: unknown)
            process_path: Full path to executable (default: empty)
            is_approved: Enterprise approval status
            connection_frequency: Number of connections to domain in last 5 minutes
            high_frequency: True if domain exceeds high-frequency threshold
            bytes_read: Disk bytes read by process (proxy for activity)
            bytes_write: Disk bytes written by process (proxy for activity)

        Returns:
            Event dict matching required schema
        """
        event_type = "blocked" if is_blocked else "detected"

        event = {
            "org_id": self._org_id,
            "user_id": self._identity.get("user_id", "unknown"),
            "device_id": self._device_id,
            "tool_name": tool_name,
            "domain": domain,
            "category": category,
            "vendor": vendor,
            "risk_level": risk_level,
            "event_type": event_type,
            "process_name": process_name,
            "process_path": process_path,
            "is_approved": is_approved,
            "is_blocked": is_blocked,
            "sensitivity_score": sensitivity_score,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        # Include optional analytics fields only when provided
        if connection_frequency is not None:
            event["connection_frequency"] = connection_frequency
        if high_frequency is not None:
            event["high_frequency"] = high_frequency
        if bytes_read is not None:
            event["bytes_read"] = bytes_read
        if bytes_write is not None:
            event["bytes_write"] = bytes_write
        if block_reason is not None:
            event["block_reason"] = block_reason
        if policy_matched is not None:
            event["policy_matched"] = policy_matched

        # Validate required fields
        self._validate_event(event)

        logger.debug(f"Built event for {tool_name} ({domain})")
        return event

    def _validate_event(self, event: Dict[str, Any]) -> None:
        """Validate event has all required fields.

        Args:
            event: Event dict

        Raises:
            ValueError: If required field is missing
        """
        for field in self.REQUIRED_FIELDS:
            if field not in event:
                raise ValueError(f"Missing required field: {field}")

    def is_valid_event(self, event: Dict[str, Any]) -> bool:
        """Check if event has all required fields.

        Args:
            event: Event dict

        Returns:
            True if valid
        """
        for field in self.REQUIRED_FIELDS:
            if field not in event:
                return False
        return True


def create_event_builder(identity: Dict[str, str], device_id: str, org_id: str) -> EventBuilder:
    """Create an event builder instance.

    Args:
        identity: User identity dict
        device_id: Device ID
        org_id: Organization ID

    Returns:
        EventBuilder instance
    """
    return EventBuilder(identity, device_id, org_id)

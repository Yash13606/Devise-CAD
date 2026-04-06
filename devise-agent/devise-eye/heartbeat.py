"""Heartbeat module for Devise Desktop Agent via Supabase.

Sends periodic health signals to the backend.
"""

import logging
import platform
from datetime import datetime, timezone
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Heartbeat interval in seconds (5 minutes)
HEARTBEAT_INTERVAL = 300  


class HeartbeatSender:
    """Sends periodic heartbeat events to Supabase."""

    def __init__(
        self,
        device_id: str,
        org_id: str,
        user_email: str,
        agent_version: str,
        supabase_url: str,
        supabase_key: str,
        queue=None,
        timeout: float = 10.0,
    ):
        self._device_id = device_id
        self._org_id = org_id
        self._user_email = user_email
        self._agent_version = agent_version
        self._supabase_url = supabase_url.rstrip("/")
        self._supabase_key = supabase_key
        self._queue = queue
        self._timeout = timeout

        self._last_detection_time: Optional[datetime] = None
        self._restart_detected = False

    def update_last_detection(self, timestamp: datetime) -> None:
        self._last_detection_time = timestamp

    def get_os_version(self) -> str:
        return f"{platform.system()} {platform.release()}"

    def build_heartbeat_payload(self) -> Dict[str, Any]:
        return {
            "device_id": self._device_id,
            "org_id": self._org_id,
            "user_email": self._user_email,
            "status": "active",
            "last_seen": datetime.now(timezone.utc).isoformat(),
            "os_version": self.get_os_version(),
            "agent_version": self._agent_version,
        }

    async def send_heartbeat(self) -> bool:
        import httpx

        payload = self.build_heartbeat_payload()
        url = f"{self._supabase_url}/rest/v1/heartbeats"

        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers={
                        "apikey": self._supabase_key,
                        "Authorization": f"Bearer {self._supabase_key}",
                        "Content-Type": "application/json",
                        "Prefer": "resolution=merge-duplicates"
                    },
                )
                response.raise_for_status()

                logger.info(f"Heartbeat upserted to Supabase successfully")
                return True

        except Exception as e:
            logger.warning(f"Failed to send heartbeat to Supabase: {e}")
            return False


def create_heartbeat_sender(
    device_id: str,
    org_id: str,
    user_email: str,
    agent_version: str,
    supabase_url: str,
    supabase_key: str,
    queue=None,
) -> HeartbeatSender:
    return HeartbeatSender(
        device_id=device_id,
        org_id=org_id,
        user_email=user_email,
        agent_version=agent_version,
        supabase_url=supabase_url,
        supabase_key=supabase_key,
        queue=queue,
    )

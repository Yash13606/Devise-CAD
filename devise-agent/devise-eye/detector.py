"""Network connection detection module for Devise Desktop Agent."""

import logging
import psutil
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta


logger = logging.getLogger(__name__)


class NetworkDetector:
    """Detects network connections to AI tool domains."""

    # Filter to only ESTABLISHED connections (FR-02)
    FILTERED_STATES = {
        "TIME_WAIT",
        "CLOSE_WAIT",
        "LISTEN",
        "SYN_SENT",
        "SYN_RECV",
        "FIN_WAIT1",
        "FIN_WAIT2",
        "CLOSING",
        "LAST_ACK",
        "CLOSED",
    }

    def __init__(self, poll_interval: int = 30, process_resolver=None, dedup_window: int = 300):
        """Initialize network detector.

        Args:
            poll_interval: Polling interval in seconds (default 30)
            process_resolver: Optional ProcessResolver for process info
            dedup_window: Seconds before a seen connection key expires (default 300)
        """
        self._poll_interval = poll_interval
        self._dedup_window = dedup_window
        # Dict[conn_key, first_seen_time] — entries expire after dedup_window seconds
        self._seen_connections: Dict[str, datetime] = {}
        self._process_resolver = process_resolver

    @property
    def poll_interval(self) -> int:
        """Get polling interval."""
        return self._poll_interval

    def set_process_resolver(self, resolver) -> None:
        """Set process resolver for detailed process info.

        Args:
            resolver: ProcessResolver instance
        """
        self._process_resolver = resolver

    def get_established_connections(self) -> List[Dict[str, Any]]:
        """Get all ESTABLISHED network connections.

        Returns:
            List of connection dicts with remote IP, port, status
        """
        connections = []

        try:
            for conn in psutil.net_connections(kind="inet"):
                # Filter by ESTABLISHED state only (FR-02)
                if conn.status not in self.FILTERED_STATES:
                    if conn.raddr:
                        connection_info = {
                            "remote_addr": conn.raddr.ip,
                            "remote_port": conn.raddr.port,
                            "status": conn.status,
                            "pid": conn.pid,
                            "timestamp": datetime.utcnow().isoformat(),
                        }
                        connections.append(connection_info)

        except (psutil.AccessDenied, PermissionError) as e:
            logger.debug(f"Access denied when enumerating connections: {e}")
        except Exception as e:
            logger.error(f"Error enumerating connections: {e}")

        return connections

    def get_unique_remote_ips(self) -> List[str]:
        """Get unique remote IPs from ESTABLISHED connections.

        Returns:
            List of unique remote IP addresses
        """
        connections = self.get_established_connections()
        unique_ips = list(
            set(conn["remote_addr"] for conn in connections if conn["remote_addr"])
        )

        logger.debug(f"Found {len(unique_ips)} unique remote IPs")
        return unique_ips

    def get_connections_by_process(self) -> Dict[int, List[Dict]]:
        """Get connections grouped by process PID.

        Returns:
            Dict mapping PID to list of connections
        """
        connections = self.get_established_connections()
        by_process: Dict[int, List[Dict]] = {}

        for conn in connections:
            pid = conn.get("pid")
            if pid:
                if pid not in by_process:
                    by_process[pid] = []
                by_process[pid].append(conn)

        return by_process

    def get_process_name(self, pid: int) -> Optional[str]:
        """Get process name from PID.

        Args:
            pid: Process ID

        Returns:
            Process name or None if not found
        """
        if self._process_resolver:
            name, _, _ = self._process_resolver.resolve(pid)
            return name

        try:
            process = psutil.Process(pid)
            return process.name()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return None

    def get_process_info(self, pid: int) -> Dict[str, str]:
        """Get full process info from PID.

        Args:
            pid: Process ID

        Returns:
            Dict with process_name and process_path
        """
        if self._process_resolver:
            name, path, _ = self._process_resolver.resolve(pid)
            return {"process_name": name, "process_path": path}

        # Fallback to basic psutil
        try:
            process = psutil.Process(pid)
            name = process.name()
            try:
                path = process.exe() or ""
            except (psutil.AccessDenied, psutil.NoSuchProcess):
                path = ""
            return {"process_name": name, "process_path": path}
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return {"process_name": "unknown", "process_path": ""}

    def run_detection_cycle(self) -> List[Dict[str, Any]]:
        """Run a single detection cycle.

        Returns:
            List of new connections not seen in previous cycle
        """
        current_connections = self.get_established_connections()
        now = datetime.utcnow()

        # Evict expired entries based on deduplication window (Fix 3)
        cutoff = now - timedelta(seconds=self._dedup_window)
        self._seen_connections = {
            k: v for k, v in self._seen_connections.items() if v > cutoff
        }

        # Create unique key for each connection
        new_connections = []
        for conn in current_connections:
            conn_key = f"{conn['remote_addr']}:{conn['remote_port']}:{conn.get('pid', 'unknown')}"

            if conn_key not in self._seen_connections:
                self._seen_connections[conn_key] = now

                # Add process info if resolver available
                if self._process_resolver and conn.get("pid"):
                    process_info = self.get_process_info(conn["pid"])
                    conn["process_name"] = process_info["process_name"]
                    conn["process_path"] = process_info["process_path"]

                new_connections.append(conn)

        return new_connections


def create_detector(
    poll_interval: int = 30,
    process_resolver=None,
    dedup_window: int = 300,
) -> NetworkDetector:
    """Create a network detector instance.

    Args:
        poll_interval: Polling interval in seconds
        process_resolver: Optional ProcessResolver
        dedup_window: TTL for seen connections cache in seconds

    Returns:
        NetworkDetector instance
    """
    return NetworkDetector(poll_interval, process_resolver, dedup_window)

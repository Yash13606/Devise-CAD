"""Sensitivity monitor for Devise Desktop Agent.

Monitors clipboard content and active window titles to calculate local
risk scores and determine the sensitivity of data being sent to AI tools.
"""

import logging
import threading
import time
from typing import Dict, Any, Optional

try:
    import pyperclip
    _HAS_PYPERCLIP = True
except ImportError:
    _HAS_PYPERCLIP = False

try:
    import win32gui
    import win32process
    _HAS_WIN32 = True
except ImportError:
    _HAS_WIN32 = False

logger = logging.getLogger(__name__)


class SensitivityMonitor:
    """Monitors clipboard and active windows for sensitive data indicators."""

    # Keywords that suggest sensitive data might be in context
    SENSITIVE_KEYWORDS = [
        "confidential", "internal use only", "secret",
        "ssn", "social security", "password", "credential",
        "salary", "payroll", "financial", "patient data",
        "phi", "pii", "api key", "auth_token"
    ]

    def __init__(self, poll_interval: int = 1):
        """Initialize SensitivityMonitor.

        Args:
            poll_interval: How often to check clipboard/windows (seconds)
        """
        self._poll_interval = poll_interval
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None

        self._last_clipboard_content = ""
        self._current_sensitivity_score = 0
        self._last_active_window_title = ""

    def _get_active_window_title(self) -> str:
        """Get the title of the currently focused window on Windows."""
        if not _HAS_WIN32:
            return ""
        try:
            window = win32gui.GetForegroundWindow()
            title = win32gui.GetWindowText(window)
            return title.lower()
        except Exception as e:
            logger.debug(f"Failed to get active window title: {e}")
            return ""

    def _get_clipboard_content(self) -> str:
        """Get current text from the clipboard."""
        if not _HAS_PYPERCLIP:
            return ""
        try:
            content = pyperclip.paste()
            return content.lower() if content else ""
        except Exception as e:
            logger.debug(f"Failed to read clipboard: {e}")
            return ""

    def _calculate_sensitivity(self, text: str) -> int:
        """Calculate a basic sensitivity score based on keyword matching.
        
        Args:
            text: The text to analyze
            
        Returns:
            Score from 0 to 100 based on hits.
        """
        score = 0
        if not text:
            return score

        for keyword in self.SENSITIVE_KEYWORDS:
            if keyword in text:
                score += 20  # +20 risk per keyword hit

        return min(score, 100)  # Cap at 100

    def _monitor_loop(self):
        """Main loop for polling sensors."""
        logger.info("Sensitivity monitor started.")
        while not self._stop_event.is_set():
            clipboard_text = self._get_clipboard_content()
            window_title = self._get_active_window_title()

            # Optional: only recalculate if changed
            if clipboard_text != self._last_clipboard_content or window_title != self._last_active_window_title:
                clip_score = self._calculate_sensitivity(clipboard_text)
                title_score = self._calculate_sensitivity(window_title)

                # Use the highest risk observed in the current context
                self._current_sensitivity_score = max(clip_score, title_score)

                self._last_clipboard_content = clipboard_text
                self._last_active_window_title = window_title

            self._stop_event.wait(self._poll_interval)
            
        logger.info("Sensitivity monitor stopped.")

    def start(self):
        """Start the monitor thread."""
        if not _HAS_PYPERCLIP and not _HAS_WIN32:
            logger.warning("pyperclip and pywin32 not installed. Sensitivity monitor disabled.")
            return

        if self._thread and self._thread.is_alive():
            return
            
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self._thread.start()

    def stop(self):
        """Stop the monitor thread."""
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=2.0)

    def get_current_score(self) -> int:
        """Retrieve the latest sensitivity risk score.
        
        Returns:
            Int between 0 and 100
        """
        return self._current_sensitivity_score

    def get_context_summary(self) -> Dict[str, Any]:
        """Return a summary of the current sensitive context."""
        return {
            "score": self._current_sensitivity_score,
            "window_title": self._last_active_window_title,
            # We purposely do NOT send raw clipboard data to the backend,
            # only the boolean indicator if it contained sensitive keywords.
            "clipboard_has_sensitive_data": self._calculate_sensitivity(self._last_clipboard_content) > 0
        }


def create_sensitivity_monitor(poll_interval: int = 1) -> SensitivityMonitor:
    """Create a sensitivity monitor instance."""
    return SensitivityMonitor(poll_interval)

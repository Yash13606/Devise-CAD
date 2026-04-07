"""HTTP reporter module for Devise Desktop Agent using Supabase.

Writes events directly to Supabase PostgREST API.
Falls back to offline queue on failure.
"""

import asyncio
import logging
from typing import Dict, Any, Optional, List
import httpx

logger = logging.getLogger(__name__)

# Backoff intervals in seconds
BACKOFF_INTERVALS = [30, 60, 120, 300]
MAX_RETRIES = 4
BATCH_SIZE = 100

class SupabaseReporter:
    """Reports events to Supabase REST API."""

    def __init__(
        self,
        supabase_url: str,
        supabase_key: str,
        timeout: float = 10.0,
        queue=None,
    ):
        """Initialize Supabase reporter.

        Args:
            supabase_url: Supabase project URL
            supabase_key: Supabase API Key (Anon or Service Role)
            timeout: Request timeout in seconds
            queue: Optional EventQueue for offline buffering
        """
        self._supabase_url = supabase_url.rstrip("/")
        self._supabase_key = supabase_key
        self._timeout = timeout
        self._queue = queue
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create async HTTP client with Supabase auth headers."""
        if self._client is not None:
            return self._client

        self._client = httpx.AsyncClient(
            timeout=self._timeout,
            headers={
                "apikey": self._supabase_key,
                "Authorization": f"Bearer {self._supabase_key}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
        )
        return self._client

    def _build_collection_url(self, collection: str) -> str:
        """Build Supabase REST URL for a table."""
        return f"{self._supabase_url}/rest/v1/{collection}"

    async def _write_to_supabase(
        self, event: Dict[str, Any], collection: str = "detection_events"
    ) -> bool:
        """Write a single event document to Supabase."""
        url = self._build_collection_url(collection)
        
        # Clean the event dictionary of potential python objects if needed
        # but typical events are already JSON serializable from the event builder
        body = event

        for attempt in range(MAX_RETRIES + 1):
            try:
                client = await self._get_client()
                response = await client.post(url, json=body)

                response.raise_for_status()
                # 201 Created is typical for PostgREST inserts
                logger.debug(f"Supabase write OK: {response.status_code}")
                return True

            except httpx.HTTPStatusError as e:
                # Client errors (4xx) unlikely to be transient unless rate limiting (429)
                if 400 <= e.response.status_code < 500 and e.response.status_code != 429:
                    logger.warning(
                        f"Supabase client error {e.response.status_code}: {e.response.text[:200]}"
                    )
                    return False
                logger.warning(
                    f"Supabase server error (attempt {attempt + 1}): {e.response.status_code}"
                )
            except httpx.RequestError as e:
                logger.warning(f"Network error (attempt {attempt + 1}): {e}")
            except Exception as e:
                logger.warning(f"Unexpected error (attempt {attempt + 1}): {e}")

            if attempt < MAX_RETRIES:
                backoff = BACKOFF_INTERVALS[attempt]
                logger.info(f"Retrying Supabase write in {backoff}s...")
                await asyncio.sleep(backoff)

        return False

    def set_queue(self, queue) -> None:
        """Set the event queue for offline buffering."""
        self._queue = queue

    async def report_event(
        self, event: Dict[str, Any], collection: str = "detection_events"
    ) -> bool:
        """Report event to Supabase with retry/queue fallback."""
        success = await self._write_to_supabase(event, collection)

        if not success:
            if self._queue:
                logger.info("Supabase write failed — queueing event for later")
                self._queue.enqueue(event)
            else:
                logger.warning("Supabase write failed and no queue configured")
            return False

        return True

    async def report_events(self, events: List[Dict[str, Any]]) -> Dict[str, int]:
        """Report multiple events."""
        results = {"success": 0, "failure": 0, "queued": 0}

        for event in events:
            if await self.report_event(event):
                results["success"] += 1
            else:
                results["failure"] += 1

        return results

    async def flush_queue(self) -> Dict[str, int]:
        """Flush queued events to Supabase."""
        if not self._queue:
            return {"success": 0, "failure": 0, "skipped": 0}

        results = {"success": 0, "failure": 0, "skipped": 0}
        pending = self._queue.get_pending(limit=BATCH_SIZE)

        if not pending:
            logger.debug("No pending events in queue")
            return results

        logger.info(f"Flushing {len(pending)} queued events to Supabase")

        success_ids = []
        failed_ids = []

        for event in pending:
            queue_id = event.get("_queue_id")
            
            # Strip ALL internal queue metadata before sending to Supabase
            clean_event = event.copy()
            clean_event.pop("_queue_id", None)
            clean_event.pop("_retry_count", None)
            clean_event.pop("_created_at", None)
            
            if await self.report_event(clean_event):
                if queue_id:
                    success_ids.append(queue_id)
                results["success"] += 1
            else:
                if queue_id:
                    failed_ids.append(queue_id)
                results["failure"] += 1

        if success_ids:
            self._queue.mark_success(success_ids)
        if failed_ids:
            self._queue.mark_failed(failed_ids)

        logger.info(
            f"Queue flush done: {results['success']} sent, {results['failure']} failed"
        )
        return results

    async def close(self) -> None:
        """Close HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None

    async def __aenter__(self) -> "SupabaseReporter":
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        await self.close()

# Keep legacy class name as alias for backward compatibility
Reporter = SupabaseReporter

def create_reporter(
    supabase_url: str = "",
    supabase_key: str = "",
    timeout: float = 10.0,
    queue=None,
    **kwargs
) -> SupabaseReporter:
    """Create a Supabase reporter instance."""
    return SupabaseReporter(
        supabase_url=supabase_url,
        supabase_key=supabase_key,
        timeout=timeout,
        queue=queue,
    )

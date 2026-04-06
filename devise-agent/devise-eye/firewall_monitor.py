"""Firewall monitor for filtering blocklisted connections via Supabase.

Polls Supabase for organization firewall rules and ensures blocklisted
domains/IPs are rejected locally.
"""

import logging
import threading
import time
from typing import Dict, Any, Optional
import httpx


logger = logging.getLogger(__name__)


class FirewallMonitor:
    """Monitors and enforces organization firewall rules from Supabase."""

    def __init__(self, supabase_url: str, supabase_key: str, org_id: str, poll_interval: int = 300):
        """Initialize FirewallMonitor.
        
        Args:
            supabase_url: Supabase URL
            supabase_key: Supabase API Key
            org_id: Organization ID
            poll_interval: How often to poll Supabase for rule changes (seconds)
        """
        self._supabase_url = supabase_url.rstrip("/")
        self._supabase_key = supabase_key
        self._org_id = org_id
        self._poll_interval = poll_interval
        
        self._rules: Dict[str, str] = {}  # domain -> "allow" | "block"
        
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None

    def _poll_rules(self):
        """Fetch firewall rules from Supabase."""
        headers = {
            "apikey": self._supabase_key,
            "Authorization": f"Bearer {self._supabase_key}",
            "Content-Type": "application/json"
        }
        
        # We query the `firewall_rules` table where org_id matches
        url = f"{self._supabase_url}/rest/v1/firewall_rules?org_id=eq.{self._org_id}"
        
        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(url, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    new_rules = {}
                    
                    # Supabase returns a list of row dicts
                    for row in data:
                        domain = row.get("domain")
                        action = row.get("action")  # or "status" depending on schema
                        # Fallback for alternative schema
                        if not action and "status" in row:
                            action = row.get("status")
                            
                        if domain and action:
                            new_rules[domain.lower()] = action.lower()
                            
                    self._rules = new_rules
                    logger.info(f"Updated local firewall rules: {len(self._rules)} rules loaded from Supabase.")
                elif response.status_code == 404:
                     logger.debug("No firewall rules table found. Starting with empty ruleset.")
                     self._rules = {}
                else:
                    logger.error(f"Failed to fetch firewall rules: {response.status_code} - {response.text}")
                    
        except Exception as e:
             logger.error(f"Exception while polling firewall rules: {e}")

    def _monitor_loop(self):
        """Main loop for polling rules."""
        logger.info("Firewall monitor started.")
        # Perform initial poll immediately
        self._poll_rules()

        while not self._stop_event.is_set():
            # Wait with interruptable sleep
            if self._stop_event.wait(self._poll_interval):
                break
            self._poll_rules()
            
        logger.info("Firewall monitor stopped.")

    def start(self):
        """Start the monitor thread."""
        if self._thread and self._thread.is_alive():
            return
            
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self._thread.start()

    def stop(self):
        """Stop the monitor thread."""
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=5.0)

    def is_blocked(self, domain: str) -> bool:
        """Check if a domain is blocklisted.
        
        Args:
            domain: The domain to check
            
        Returns:
            True if the domain is explicitly blocked, False otherwise.
        """
        if not domain:
            return False
            
        # Optional: Implement sub-domain wildcards (e.g. *.chatgpt.com)
        domain = domain.lower()
        
        # Explicit block wins
        if self._rules.get(domain) == "block":
            return True
            
        # Check for wildcard matches (if rule is "chatgpt.com", block "api.chatgpt.com")
        for rule_domain, action in self._rules.items():
            if action == "block" and (domain.endswith(f".{rule_domain}") or domain == rule_domain):
                 return True
                 
        return False


def create_firewall_monitor(supabase_url: str, supabase_key: str, org_id: str, poll_interval: int = 300) -> FirewallMonitor:
    """Create a firewall monitor instance.
    
    Args:
        supabase_url: Supabase URL
        supabase_key: Supabase API Key
        org_id: Organization ID
        poll_interval: Seconds between polls
        
    Returns:
        FirewallMonitor instance
    """
    return FirewallMonitor(supabase_url, supabase_key, org_id, poll_interval)

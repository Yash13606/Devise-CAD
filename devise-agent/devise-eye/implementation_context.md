# Devise Desktop Agent - Implementation Context

This document outlines the complete current state of the Devise Desktop Agent implementation, detailing the modules that have been built, their specific responsibilities, and how they map to the overall system requirements.

## 1. Core Architecture & Main Loop (`main.py`)
The main entry point for the Devise Agent uses an asynchronous, continuous monitoring loop. 
- **Graceful Shutdown**: Properly handles `SIGTERM` and `SIGINT` (on Unix-like systems) to ensure no data is lost before exiting.
- **Asynchronous Processing**: Uses Python's `asyncio` for non-blocking I/O during network requests and config polling.
- **Module Orchestration**: Initializes all subsystems (DNS, networking, registry, tracking, identity) and runs them in a timed detection cycle.

## 2. Detection & Process Monitoring
- **Connection Detection (`detector.py`)**: Leverages `psutil` to list active network connections. Identifies remote IPv4/IPv6 addresses and ports connected by local processes.
- **Process Resolution (`process_resolver.py`)**: Maps connection PIDs to their executable path (`FR-07`) and name (`FR-06`). 
- **I/O Tracking**: Extracts `bytes_read` and `bytes_write` counts from running processes to measure potential data exfiltration limits (`FR-11`).

## 3. DNS & Domain Resolution
- **Standard DNS Resolver (`dns_resolver.py`)**: Uses system DNS and reverse lookups to acquire a hostname from an IP address.
- **DoH Resolver (`doh_resolver.py`)**: Implements DNS-over-HTTPS (`FR-09`) (using Cloudflare as primary) for enhanced privacy and security, falling back to the standard resolver.

## 4. Evaluation & Deduplication
- **Registry Engine (`registry.py`)**: Matches resolved hostnames against a known catalog of AI tools (e.g., ChatGPT, Claude) with categories, vendors, and risk levels. Optionally supports remote fetching of updated registries.
- **Deduplication (`deduplicator.py`)**: Evaluates tool usage and implements a moving window to prevent spamming the backend with duplicate events for continuous/keep-alive connections.

## 5. Metadata & Analytics
- **Identity Resolver (`identity.py`)**: Extracts internal environment metadata (system profiles, unique `device_id`, and `user_email`), appending this context to all fired events so the Dashboard can associate activity to specific employee laptops (`FR-20`).
- **Frequency Tracker (`frequency_tracker.py`)**: Keeps track of how often particular domains are accessed within a sliding 5-minute window, adding anomaly indicators for high-frequency connection behaviors (`FR-10`).
- **Event Builder (`event_builder.py`)**: Serializes connection, process, identity, and analytics data into the strict JSON schema required by the Firestore backend (`detection_events`).

## 6. Networking & Resilience
- **Event Reporter (`reporter.py`)**: Uses `httpx` to send detection payloads to the Devise backend using an authorization bearer token. Handles timeouts and network errors gracefully.
- **Offline Queuing (`queue.py`)**: Provides robust buffering (`FR-18`). If an event report fails (e.g., due to an internet drop), the event is stored in an encrypted local queue (using derived keys from `api_key` and `device_id`). The queue is routinely flushed when connectivity is restored (`FR-17`).

## 7. Configuration & Remote Settings
- **Configuration Manager (`config.py`)**: Loads variables and API keys from local configuration files or environment variables.
- **Config Poller**: Periodically checks the backend to update agent policies dynamically (`FR-30`).

## 8. Advanced Security & Health Monitoring (Phase 3 Modules)
- **Heartbeat Sender (`heartbeat.py`)**: Fires `active` states periodically to update the "Active Agents" count in the Dashboard frontend. Attaches the `last_seen` timestamp (`FR-20`).
- **Liveness Monitor (`liveness_monitor.py`)**: Tracks heartbeats locally to identify gaps that could indicate the agent was unexpectedly killed, suspended, or crashed (`FR-29`). When resuming, it flags "suspicious" gaps to the backend.
- **Tamper Guard (`tamper_guard.py`)**: On startup, checks the binary's footprint and hash against expected signatures to detect tampering or unauthorized modifications (`FR-28`). Alerts the backend if the executable's integrity cannot be verified.

## Next Steps / Pending Alignment
- **Frontend Integration**: Most features implemented natively map to the defined expectations in `context.md` (e.g., the payloads for `heartbeats` and `detection_events`).
- **Data Risk Monitoring**: Advanced Windows/clipboard monitoring and OCR might need to be verified or extended based on the latest iteration of the B2B privacy requirements defined in `context.md` (Clipboard and active window scraping).
- **Firewall Capabilities**: Network proxy interception and process killing logic (if `firewall_rules` dictate a block action) logic.

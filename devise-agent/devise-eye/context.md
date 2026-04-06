Devise AI Governance — Complete Architecture Context
You are tasked with building the Devise Desktop Agent, a background Python script that runs on employee machines. To build this correctly, you must understand the entire end-to-end architecture of Devise, an enterprise B2B SaaS platform for AI Governance.

This document explicitly details the React frontend architecture, the complete feature set of the web dashboard, the Firebase serverless backend, and exactly how the Desktop Agent must integrate with them.

1. System Architecture Overview
Devise operates on a fully serverless, real-time architecture:

Frontend Dashboard (React SPA): Hosted on Vercel. Admins log in here to view team AI usage, configure policies, and mitigate data risks.
Backend (Firebase): Cloud Firestore acts as the central state engine. Authentication is handled by Firebase Auth.
Desktop Agent (Python): Runs locally on Windows/macOS. It monitors the OS for AI tool usage, enforces policies, detects sensitive data patterns (e.g., source code in clipboard), and pushes findings directly to Firestore.
Core Philosophy:

The Frontend NEVER talks to a traditional API server (like Node.js or Python FastAPI). It talks directly to Firestore.
The Desktop Agent NEVER talks to a traditional API server. It talks directly to Firestore using firebase-admin and a 
service-account.json
.
The two systems (Frontend & Agent) synchronize entirely by reading and writing to the same Firestore collections, relying on Firestore's real-time listeners (onSnapshot) to update instantly.
2. The Frontend Codebase (React + Vite + TypeScript)
The frontend is a modern React Single Page Application (SPA).

Tech Stack
Framework: React 18 + TypeScript + Vite
Styling: Tailwind CSS + custom glassmorphic CSS (
index.css
)
UI Components: shadcn/ui (Radix UI primitives) and Tabler/Lucide icons.
Data Fetching: @tanstack/react-query and native Firebase JS SDK.
Routing: React Router DOM (/, /login, /dashboard). Vercel is configured with a root 
vercel.json
 SPA rewrite (/(.*) -> /index.html).
Project Structure (src/)
App.tsx
: Main routing engine. Defines the 
Tab
 state for the Dashboard.
components/layout/: Holds the main structural shells: 
DashboardLayout
, 
Sidebar
, 
TopBar
.
components/dashboard/: Holds the individual feature tabs (e.g., 
FirewallTab.tsx
, 
DataRiskTab.tsx
, 
LiveFeedTab.tsx
).
pages/: Full-page routes (e.g., landing/LandingPage.tsx, auth/LoginPage.tsx).
services/api.ts
: The most critical file. Contains all Firestore wrapper functions (e.g., 
fetchBlockEvents()
, 
subscribeToHighRiskEvents()
).
Security & Multi-Tenancy
Every company using Devise is assigned an org_id upon signup. Every single document in Firestore requires an org_id field. The Frontend enforces this via Firestore Security Rules (users can only read docs matching their profile's org_id).

3. End-to-End Feature Map
When building the agent, remember that its data populates these specific frontend tabs:

A. Dashboard Overview (overview)
Shows high-level metrics: Active Agents, Time Saved, Alerts.

Agent Requirement: Writes to the heartbeats collection every 5 mins. The frontend counts unique device_ids in heartbeats to determine "Active Agents" online.
B. Live Feed (live-feed)
A real-time scrolling table of what tools are being opened right now.

Agent Requirement: When an app launches (e.g., cursor.exe, ChatGPT in Chrome), the agent writes a basic document to detection_events with event_type: "detected". The frontend listens via onSnapshot and animates these rows in.
C. AI Firewall (firewall)
Allows admins to block specific AI tools company-wide.

Frontend Logic: Admins toggle tools ALLOWED/BLOCKED. Writes to org_settings/{org_id}/firewall_rules.
Agent Requirement: Periodically fetches firewall_rules. If a user opens a blocked tool, the agent must intercept/kill it.
Agent Requirement: Write to detection_events with event_type: "blocked" and block_reason. This populates the "Block Events" table in the UI.
D. Data Risk (data-risk)
Detects sensitive data leakage (PII, source code, financial docs) into AI tools.

Frontend Logic: A feed of high-risk events, plus an "Employee Risk Leaderboard" showing who violates policies the most. High-risk events trigger real-time toast alerts on the admin's screen.
Agent Requirement: Monitors window titles and clipboard size (NOT content). If it sees an anomaly (e.g., "ChatGPT - Uploading financials.pdf" or pasting > 5000 chars), it writes to detection_events with sensitivity_flag: "FINANCIAL_KEYWORDS" and sensitivity_score: 85.
E. Team & Devices (team, devices)
Lists all employees and their laptops.

Agent Requirement: Uses local OS module (os, getpass) to capture the local Windows/Mac username and device hostname, attaching them as user_id and device_id to every event.
4. Firestore Database Schema
The Desktop Agent must write payloads exactly matching these TypeScript interfaces used by the Frontend.

Collection: heartbeats
Used to track online/offline status of employee laptops.

json
{
  "device_id": "HOSTNAME-MAC_ADDRESS",
  "org_id": "your_org_id_here",
  "user_email": "john.doe@company.com", // Or local Windows username
  "status": "active", // or "idle"
  "last_seen": "<Firestore Server Timestamp>",
  "os_version": "Windows 11",
  "agent_version": "1.0.0"
}
Collection: detection_events
The central nervous system of Devise. Used for Live Feed, Firewall Blocks, and Data Risks.

json
{
  "device_id": "HOSTNAME-MAC_ADDRESS",
  "org_id": "your_org_id_here",
  "user_id": "john.doe@company.com", 
  "tool_name": "ChatGPT",          // e.g., "Claude", "Notion AI", "Cursor"
  "domain": "chat.openai.com",     // Optional URL if intercepted via browser
  "timestamp": "<Firestore Server Timestamp>",
  
  // -- FIREWALL FIELDS --
  "event_type": "detected",        // MUST BE either "detected" or "blocked"
  "block_reason": null,            // Populate if blocked! (e.g., "Admin Policy")
  "policy_matched": "ChatGPT",     // The rule ID that caused the block
  
  // -- DATA RISK FIELDS --
  "sensitivity_flag": null,        // e.g., "SOURCE_CODE", "LARGE_PASTE", "FINANCIAL_KEYWORDS", "CREDENTIALS_PATTERN", "FILE_UPLOAD"
  "sensitivity_score": 0,          // Integer 0 to 100
  "window_title": "ChatGPT - Uploading financial_report.pdf", 
  "paste_size_chars": 5432,        // Approximate length of clipboard paste
  "file_name": "financial_report.pdf",
  "reviewed": false                // Dashboard sets this to true when admin clicks "Mark Reviewed"
}
Subcollection: org_settings/{org_id}/firewall_rules/{tool_name}
The agent READS from here to enforce blocks.

json
{
  "tool_name": "ChatGPT",
  "domain": "chat.openai.com",
  "status": "blocked", // If "blocked", the agent must intercept
  "updated_at": "<Timestamp>"
}
5. Desktop Agent Implementation Guidelines (Python)
To fulfill the requirements of the React frontend, the Python agent must follow these rules:

Libraries: Use firebase-admin (Firestore), psutil (Process enumeration/killing), pygetwindow or win32gui / AppKit (Active window titles), and pyperclip (Clipboard monitoring).
Authentication: Initialize firebase-admin using a downloaded 
service-account.json
. Do NOT hardcode the org_id—load it from a local config file (e.g., config.yaml).
Privacy Guarantee (CRITICAL): Devise is B2B software. You must never read or transmit the actual text of employee conversations or clipboard contents to Firebase. You are only transmitting lengths (len(clipboard)), window titles, and metadata tags (sensitivity_flag).
Graceful Degeneration: If the internet drops, the agent should ideally queue detection_events locally (e.g., SQLite or simple JSON queue) and flush them to Firebase when the connection returns, ensuring the dashboard's Analytics tab remains accurate.
Multi-Threading: You will need a main loop with multiple timed threads:
Thread A: Active Window / DNS monitor (every 1 second)
Thread B: Clipboard size monitor (every 1 second)
Thread C: Pull firewall_rules from Firestore (every 5 minutes)
Thread D: Push heartbeats to Firestore (every 5-10 minutes)

# Devise AI Governance — Complete Architecture Context

You are tasked with building the **Devise Desktop Agent**, a background Python script that runs on employee machines. To build this correctly, you must understand the entire end-to-end architecture of **Devise**, an enterprise B2B SaaS platform for AI Governance.

This document explicitly details the React frontend architecture, the complete feature set of the web dashboard, the Firebase serverless backend, and exactly how the Desktop Agent must integrate with them.

---

## 1. System Architecture Overview

Devise operates on a fully serverless, real-time architecture:
1.  **Frontend Dashboard (React SPA)**: Hosted on Vercel. Admins log in here to view team AI usage, configure policies, and mitigate data risks.
2.  **Backend (Firebase)**: Cloud Firestore acts as the central state engine. Authentication is handled by Firebase Auth.
3.  **Desktop Agent (Python)**: Runs locally on Windows/macOS. It monitors the OS for AI tool usage, enforces policies, detects sensitive data patterns (e.g., source code in clipboard), and pushes findings directly to Firestore.

**Core Philosophy:** 
- The Frontend NEVER talks to a traditional API server (like Node.js or Python FastAPI). It talks directly to Firestore.
- The Desktop Agent NEVER talks to a traditional API server. It talks directly to Firestore using `firebase-admin` and a `service-account.json`.
- The two systems (Frontend & Agent) synchronize entirely by reading and writing to the same Firestore collections, relying on Firestore's real-time listeners (`onSnapshot`) to update instantly.

---

## 2. The Frontend Codebase (React + Vite + TypeScript)

The frontend is a modern React Single Page Application (SPA).

### Tech Stack
-   **Framework**: React 18 + TypeScript + Vite
-   **Styling**: Tailwind CSS + custom glassmorphic CSS ([index.css](cci:7://file:///d:/devise-iris/frontend/src/index.css:0:0-0:0))
-   **UI Components**: shadcn/ui (Radix UI primitives) and Tabler/Lucide icons.
-   **Data Fetching**: `@tanstack/react-query` and native Firebase JS SDK.
-   **Routing**: React Router DOM (`/`, `/login`, `/dashboard`). Vercel is configured with a root [vercel.json](cci:7://file:///d:/devise-iris/vercel.json:0:0-0:0) SPA rewrite (`/(.*) -> /index.html`).

### Project Structure (`src/`)
*   [App.tsx](cci:7://file:///d:/devise-iris/frontend/src/App.tsx:0:0-0:0): Main routing engine. Defines the [Tab](cci:2://file:///d:/devise-iris/frontend/src/components/layout/UserProfileDropdown.tsx:6:0-6:140) state for the Dashboard.
*   `components/layout/`: Holds the main structural shells: [DashboardLayout](cci:1://file:///d:/devise-iris/frontend/src/components/layout/DashboardLayout.tsx:11:0-44:1), [Sidebar](cci:1://file:///d:/devise-iris/frontend/src/components/layout/Sidebar.tsx:37:0-134:1), [TopBar](cci:1://file:///d:/devise-iris/frontend/src/components/layout/TopBar.tsx:116:0-300:1).
*   `components/dashboard/`: Holds the individual feature tabs (e.g., [FirewallTab.tsx](cci:7://file:///d:/devise-iris/frontend/src/components/dashboard/FirewallTab.tsx:0:0-0:0), [DataRiskTab.tsx](cci:7://file:///d:/devise-iris/frontend/src/components/dashboard/DataRiskTab.tsx:0:0-0:0), [LiveFeedTab.tsx](cci:7://file:///d:/devise-iris/frontend/src/components/dashboard/LiveFeedTab.tsx:0:0-0:0)).
*   `pages/`: Full-page routes (e.g., `landing/LandingPage.tsx`, `auth/LoginPage.tsx`).
*   [services/api.ts](cci:7://file:///d:/devise-iris/frontend/src/services/api.ts:0:0-0:0): **The most critical file.** Contains all Firestore wrapper functions (e.g., [fetchBlockEvents()](cci:1://file:///d:/devise-iris/frontend/src/services/api.ts:529:0-540:2), [subscribeToHighRiskEvents()](cci:1://file:///d:/devise-iris/frontend/src/services/api.ts:731:0-749:2)).

### Security & Multi-Tenancy
Every company using Devise is assigned an `org_id` upon signup. **Every single document** in Firestore requires an `org_id` field. The Frontend enforces this via Firestore Security Rules (users can only read docs matching their profile's `org_id`).

---

## 3. End-to-End Feature Map

When building the agent, remember that its data populates these specific frontend tabs:

### A. Dashboard Overview (`overview`)
Shows high-level metrics: Active Agents, Time Saved, Alerts.
*   *Agent Requirement*: Writes to the `heartbeats` collection every 5 mins. The frontend counts unique `device_id`s in `heartbeats` to determine "Active Agents" online.

### B. Live Feed (`live-feed`)
A real-time scrolling table of what tools are being opened right now.
*   *Agent Requirement*: When an app launches (e.g., cursor.exe, ChatGPT in Chrome), the agent writes a basic document to `detection_events` with `event_type: "detected"`. The frontend listens via `onSnapshot` and animates these rows in.

### C. AI Firewall (`firewall`)
Allows admins to block specific AI tools company-wide.
*   *Frontend Logic*: Admins toggle tools ALLOWED/BLOCKED. Writes to `org_settings/{org_id}/firewall_rules`.
*   *Agent Requirement*: Periodically fetches `firewall_rules`. If a user opens a blocked tool, the agent must intercept/kill it.
*   *Agent Requirement*: Write to `detection_events` with `event_type: "blocked"` and `block_reason`. This populates the "Block Events" table in the UI.

### D. Data Risk (`data-risk`)
Detects sensitive data leakage (PII, source code, financial docs) into AI tools.
*   *Frontend Logic*: A feed of high-risk events, plus an "Employee Risk Leaderboard" showing who violates policies the most. High-risk events trigger real-time toast alerts on the admin's screen.
*   *Agent Requirement*: Monitors window titles and clipboard size (NOT content). If it sees an anomaly (e.g., "ChatGPT - Uploading financials.pdf" or pasting > 5000 chars), it writes to `detection_events` with `sensitivity_flag: "FINANCIAL_KEYWORDS"` and `sensitivity_score: 85`.

### E. Team & Devices (`team`, `devices`)
Lists all employees and their laptops.
*   *Agent Requirement*: Uses local OS module (`os`, `getpass`) to capture the local Windows/Mac username and device hostname, attaching them as `user_id` and `device_id` to every event.

---

## 4. Firestore Database Schema

The Desktop Agent must write payloads exactly matching these TypeScript interfaces used by the Frontend.

### Collection: `heartbeats`
Used to track online/offline status of employee laptops.
```json
{
  "device_id": "HOSTNAME-MAC_ADDRESS",
  "org_id": "your_org_id_here",
  "user_email": "john.doe@company.com", // Or local Windows username
  "status": "active", // or "idle"
  "last_seen": "<Firestore Server Timestamp>",
  "os_version": "Windows 11",
  "agent_version": "1.0.0"
}
Collection: detection_events
The central nervous system of Devise. Used for Live Feed, Firewall Blocks, and Data Risks.

json
{
  "device_id": "HOSTNAME-MAC_ADDRESS",
  "org_id": "your_org_id_here",
  "user_id": "john.doe@company.com", 
  "tool_name": "ChatGPT",          // e.g., "Claude", "Notion AI", "Cursor"
  "domain": "chat.openai.com",     // Optional URL if intercepted via browser
  "timestamp": "<Firestore Server Timestamp>",
  
  // -- FIREWALL FIELDS --
  "event_type": "detected",        // MUST BE either "detected" or "blocked"
  "block_reason": null,            // Populate if blocked! (e.g., "Admin Policy")
  "policy_matched": "ChatGPT",     // The rule ID that caused the block
  
  // -- DATA RISK FIELDS --
  "sensitivity_flag": null,        // e.g., "SOURCE_CODE", "LARGE_PASTE", "FINANCIAL_KEYWORDS", "CREDENTIALS_PATTERN", "FILE_UPLOAD"
  "sensitivity_score": 0,          // Integer 0 to 100
  "window_title": "ChatGPT - Uploading financial_report.pdf", 
  "paste_size_chars": 5432,        // Approximate length of clipboard paste
  "file_name": "financial_report.pdf",
  "reviewed": false                // Dashboard sets this to true when admin clicks "Mark Reviewed"
}
Subcollection: org_settings/{org_id}/firewall_rules/{tool_name}
The agent READS from here to enforce blocks.

json
{
  "tool_name": "ChatGPT",
  "domain": "chat.openai.com",
  "status": "blocked", // If "blocked", the agent must intercept
  "updated_at": "<Timestamp>"
}
5. Desktop Agent Implementation Guidelines (Python)
To fulfill the requirements of the React frontend, the Python agent must follow these rules:

Libraries: Use firebase-admin (Firestore), psutil (Process enumeration/killing), pygetwindow or win32gui / AppKit (Active window titles), and pyperclip (Clipboard monitoring).
Authentication: Initialize firebase-admin using a downloaded service-account.json. Do NOT hardcode the org_id—load it from a local config file (e.g., config.yaml).
Privacy Guarantee (CRITICAL): Devise is B2B software. You must never read or transmit the actual text of employee conversations or clipboard contents to Firebase. You are only transmitting lengths (len(clipboard)), window titles, and metadata tags (sensitivity_flag).
Graceful Degeneration: If the internet drops, the agent should ideally queue detection_events locally (e.g., SQLite or simple JSON queue) and flush them to Firebase when the connection returns, ensuring the dashboard's Analytics tab remains accurate.
Multi-Threading: You will need a main loop with multiple timed threads:
Thread A: Active Window / DNS monitor (every 1 second)
Thread B: Clipboard size monitor (every 1 second)
Thread C: Pull firewall_rules from Firestore (every 5 minutes)
Thread D: Push heartbeats to Firestore (every 5-10 minutes)



-- Devise Supabase Schema
-- Run this in the Supabase SQL Editor if you haven't created these tables yet during the dashboard migration.

-- 1. Create heartbeats table
CREATE TABLE IF NOT EXISTS public.heartbeats (
    device_id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    user_email TEXT,
    status TEXT,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    os_version TEXT,
    agent_version TEXT
);

-- 2. Create detection_events table
CREATE TABLE IF NOT EXISTS public.detection_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    org_id TEXT NOT NULL,
    user_id TEXT,
    tool_name TEXT NOT NULL,
    domain TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    
    -- FIREWALL FIELDS
    event_type TEXT NOT NULL, -- 'detected' or 'blocked'
    block_reason TEXT,
    policy_matched TEXT,
    
    -- DATA RISK FIELDS
    sensitivity_flag TEXT,
    sensitivity_score INTEGER DEFAULT 0,
    window_title TEXT,
    paste_size_chars INTEGER,
    file_name TEXT,
    reviewed BOOLEAN DEFAULT false,
    
    -- Additional fields from frequency tracking and processes
    process_name TEXT,
    process_path TEXT,
    category TEXT,
    vendor TEXT,
    risk_level TEXT,
    high_frequency BOOLEAN,
    connection_frequency INTEGER,
    bytes_read BIGINT,
    bytes_write BIGINT,
    is_approved BOOLEAN,
    is_blocked BOOLEAN
);

-- 3. Create firewall_rules table
CREATE TABLE IF NOT EXISTS public.firewall_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    action TEXT NOT NULL, -- 'allow' or 'block'
    tool_name TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Realtime for Dashboard (so the React app can subscribe to inserts)
alter publication supabase_realtime add table public.detection_events;
alter publication supabase_realtime add table public.heartbeats;
alter publication supabase_realtime add table public.firewall_rules;

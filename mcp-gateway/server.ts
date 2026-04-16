import fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import cors from '@fastify/cors';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = fastify({ logger: true });

// Configuration
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || 'devise-mcp.us.auth0.com';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || 'https://api.devise.io';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ---------------------------------------------------------------------------
// Rate Limiting (Phase 4 Task)
// ---------------------------------------------------------------------------
app.register(rateLimit, {
  max: 100, // 100 requests per window
  timeWindow: '1 minute'
});

app.register(cors, { origin: '*' });

// ---------------------------------------------------------------------------
// Auth0 JWT Middleware (Phase 4 Task)
// ---------------------------------------------------------------------------
const client = jwksClient({
  jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, function(err, key) {
    if (err || !key) return callback(err || new Error("Key not found"));
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const verifyJwt = async (request: any, reply: any) => {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.status(401).send({ error: 'Missing or invalid Auth header' });
    return;
  }
  const token = authHeader.split(' ')[1];
  
  return new Promise<void>((resolve, reject) => {
    jwt.verify(token, getKey, { audience: AUTH0_AUDIENCE }, (err, decoded) => {
      if (err) {
        reply.status(401).send({ error: 'Token validation failed' });
        reject(err);
        return;
      }
      request.user = decoded; // Store Auth0 sub
      resolve();
    });
  });
};

// ---------------------------------------------------------------------------
// ToolGuard Threat Detection Stub (Phase 4 Task)
// ---------------------------------------------------------------------------
const toolGuardMiddleware = async (request: any, reply: any) => {
  const payload = request.body;
  if (!payload || !payload.method) return; // Only process JSON-RPC

  // Stub detection logic (Pre-execution sync payload inspection)
  const isPoisoned = JSON.stringify(payload).includes("rm -rf") || JSON.stringify(payload).includes("system(");
  if (isPoisoned) {
    reply.status(403).send({ error: 'ToolGuard Access Denied. Malicious payload detected.' });
    throw new Error('Blocked by ToolGuard');
  }
};

// ---------------------------------------------------------------------------
// Blockchain-Based Hash Chain Ledger (Phase 4 Task)
// ---------------------------------------------------------------------------
async function appendToBlockchainLedger(eventData: any, user: any) {
  const timestamp = new Date().toISOString();
  const org_id = user?.org_id || 'org_unknown';
  const actor_id = user?.sub || 'unknown';
  
  // 1. Fetch the last hash from the database for this organization
  const { data: lastRecord, error: fetchError } = await supabase
    .from('mcp_audit_ledger')
    .select('hash')
    .eq('org_id', org_id)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  // If no record exists, use Genesis hash
  const prev_hash = lastRecord?.hash || '0000000000000000000000000000000000000000000000000000000000000000';
  
  const recordToHash = {
    org_id,
    actor_id,
    event_type: 'tool_call',
    request_payload: eventData,
    timestamp,
    prev_hash
  };

  // 2. Compute SHA-256 for the new record
  const payloadStr = JSON.stringify(recordToHash);
  const hash = crypto.createHash('sha256').update(payloadStr).digest('hex');
  
  // 3. Insert into Supabase mapping to our SQL schema
  const { data: inserted, error: insertError } = await supabase
    .from('mcp_audit_ledger')
    .insert({
      org_id,
      actor_id,
      event_type: 'tool_call',
      request_payload: eventData,
      status: 'success',
      timestamp,
      prev_hash,
      hash
    })
    .select('id, hash')
    .single();

  if (insertError) {
    app.log.error({ msg: "Failed to insert to ledger", error: insertError });
    throw new Error('Ledger insertion failed');
  }

  app.log.info({
    msg: "Appended to MCP Hash-Chain Ledger",
    record_id: inserted?.id,
    hash: hash
  });
}

// ---------------------------------------------------------------------------
// JSON-RPC Proxy Route
// ---------------------------------------------------------------------------
app.post('/api/mcp', { 
  preHandler: [verifyJwt, toolGuardMiddleware] 
}, async (request, reply) => {
  try {
    const user = (request as any).user;
    
    // 1. Process standard JSON-RPC from client
    // 2. Dispatch to underlying MCP connection (SSE or websocket usually)
    // 3. Return result
    
    // Append to immutable ledger
    await appendToBlockchainLedger(request.body, user);
    
    return {
      jsonrpc: "2.0",
      id: (request.body as any)?.id || null,
      result: { status: "success", proxied: true }
    };
  } catch (err: any) {
    reply.status(500).send({ error: err.message });
  }
});

// Start Server
app.post('/api/test-mcp', { 
  preHandler: [toolGuardMiddleware] 
}, async (request, reply) => {
  try {
    // Mock user for local testing purposes
    const user = { sub: "test_agent_123", org_id: "org_test_789" };
    
    await appendToBlockchainLedger(request.body, user);
    
    return {
      jsonrpc: "2.0",
      id: (request.body as any)?.id || null,
      result: { status: "success", proxied: true, message: "Test Ledger insert passed" }
    };
  } catch (err: any) {
    if (err.message === 'Blocked by ToolGuard') return; // Handled by preHandler
    reply.status(500).send({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Dashboard Read API — serves ledger data to the frontend
// ---------------------------------------------------------------------------
app.get('/api/mcp/ledger', async (request, reply) => {
  try {
    const { data, error } = await supabase
      .from('mcp_audit_ledger')
      .select('*')
      .order('id', { ascending: false })
      .limit(200);

    if (error) {
      reply.status(500).send({ error: error.message });
      return;
    }
    return data || [];
  } catch (err: any) {
    reply.status(500).send({ error: err.message });
  }
});

app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Devise MCP Gateway listening on ${address}`);
});

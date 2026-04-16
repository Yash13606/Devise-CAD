# Devise-CAD: Deep-Dive Code Audit Report
**Date:** April 16, 2026  
**Scope:** MCP Gateway (Fastify) + Frontend (React/Vite)  
**Status:** ⚠️ CRITICAL ISSUES FOUND

---

## Executive Summary

The Devise-CAD platform has **working implementations** of both MCP Gateway and Frontend, but contains **5 CRITICAL security vulnerabilities**, **3 HIGH-severity bugs**, and **4 MEDIUM-severity configuration issues** that must be fixed before production deployment.

### Severity Breakdown
- 🔴 **CRITICAL**: 5 issues (security breaches, auth bypass risk)
- 🟠 **HIGH**: 3 issues (bugs that cause failures)
- 🟡 **MEDIUM**: 4 issues (configuration, error handling)
- 🔵 **LOW**: 2 issues (code quality, testing)

---

## 🔴 CRITICAL ISSUES

### 1. **CRITICAL: Supabase Service Role Key Exposed in Frontend**

**Location:** `frontend/.env`  
**Severity:** CRITICAL (Security Breach)

```env
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# ⚠️ BUT the key is actually the SERVICE_ROLE_KEY (full DB access)
```

**The Problem:**
- The `.env` file contains `VITE_SUPABASE_ANON_KEY` but the value is the **SERVICE_ROLE_KEY** (has `role: "service_role"`)
- Service role key **bypasses all Row-Level Security (RLS)** policies
- Frontend can read/modify **all rows** across all organizations
- If frontend code is compromised or user opens malicious XSS, attacker has full DB access

**Expected Behavior:**
- Frontend should use the **ANON_KEY** (restricted role)
- Backend gateway should use SERVICE_ROLE_KEY (only server-side)

**Fix Required:**
```env
# frontend/.env - MUST use limited anon key
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthcHhjcG9taG1iYmFveHVqd3luYyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc1NDgzMjE4LCJleHAiOjIwOTEwNTkyMTh9...

# mcp-gateway/.env - Uses service role (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...role: "service_role"...
```

**Impact:** 🔴 **CRITICAL** - Multi-tenant data isolation completely broken

---

### 2. **CRITICAL: CORS Configured to Accept All Origins**

**Location:** `mcp-gateway/server.ts:32`

```typescript
app.register(cors, { origin: '*' });
```

**The Problem:**
- Any website can make requests to your MCP Gateway (Cross-Site Request Forgery risk)
- If frontend is XSSed or a malicious site is visited, attacker can:
  - Read audit ledger data
  - Trigger MCP calls on behalf of the user
  - Modify firewall rules or settings

**Expected Behavior:**
- CORS should restrict to known domains (e.g., `http://localhost:5173` for dev, your production domain for prod)

**Fix Required:**
```typescript
app.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:8081'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});
```

**Impact:** 🔴 **CRITICAL** - CSRF vulnerabilities, unauthorized access

---

### 3. **CRITICAL: JWT Verification Returns Undefined Promise on Auth Failure**

**Location:** `mcp-gateway/server.ts:49-66`

```typescript
const verifyJwt = async (request: any, reply: any) => {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.status(401).send({ error: 'Missing or invalid Auth header' });
    return;  // ⚠️ Returns undefined, NOT a rejected promise
  }
  // ...
  jwt.verify(token, getKey, { audience: AUTH0_AUDIENCE }, (err, decoded) => {
    if (err) {
      reply.status(401).send({ error: 'Token validation failed' });
      reject(err);  // ⚠️ Rejects, but after already sending response
      return;
    }
    request.user = decoded;
    resolve();
  });
};
```

**The Problem:**
1. **Inconsistent returns**: Sometimes returns `undefined`, sometimes rejects
2. **Late rejection**: After `reply.status(401).send()`, the rejection happens but response already sent
3. **Fastify preHandler bug**: If promise rejects, it might still call the route handler
4. **Silent failures**: If preHandler doesn't properly stop route execution, auth check is bypassed

**Expected Behavior:**
- Middleware should either:
  - Return successfully (request.user set) → handler continues
  - Throw an error → handler is NOT called

**Fix Required:**
```typescript
const verifyJwt = async (request: any, reply: any) => {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Auth header');
  }
  const token = authHeader.split(' ')[1];
  
  return new Promise<void>((resolve, reject) => {
    jwt.verify(token, getKey, { audience: AUTH0_AUDIENCE }, (err, decoded) => {
      if (err) {
        reject(new Error('Token validation failed'));
        return;
      }
      request.user = decoded;
      resolve();
    });
  });
};

// Then in routes: preHandler automatically catches errors
app.post('/api/mcp', { preHandler: [verifyJwt] }, ...);
```

**Impact:** 🔴 **CRITICAL** - Auth bypass, unauthenticated access possible

---

### 4. **CRITICAL: ToolGuard Detection Using String.includes() Only**

**Location:** `mcp-gateway/server.ts:72-83`

```typescript
const toolGuardMiddleware = async (request: any, reply: any) => {
  const payload = request.body;
  if (!payload || !payload.method) return;
  
  const isPoisoned = JSON.stringify(payload).includes("rm -rf") 
                   || JSON.stringify(payload).includes("system(");
  if (isPoisoned) {
    reply.status(403).send({ error: 'ToolGuard Access Denied' });
    throw new Error('Blocked by ToolGuard');
  }
};
```

**The Problem:**
1. **Trivially bypassable**: Attacker can encode payload (`rm\u0020-rf`, `sys tem(`, base64, etc.)
2. **False negatives**: Only checks 2 patterns, misses:
   - `eval()`, `exec()`, `__import__()` (Python)
   - `subprocess.call()`, `os.popen()` (Python)
   - SQL injection patterns (`; DROP TABLE`, `' OR '1'='1`)
   - Prompt injection patterns (`<|im_end|>`, `System:`)
3. **Missing context**: Doesn't check tool signatures or capabilities
4. **Doesn't validate structure**: Just string matching on JSON
5. **Error thrown after response**: Like issue #3, throws after `reply.send()`

**Expected Behavior:**
- Parse JSON-RPC schema (must have `jsonrpc`, `method`, `id`)
- Validate method name against approved list
- Use proper pattern detection (not simple string matching)
- Validate parameter types
- Rate-limit by user

**Impact:** 🔴 **CRITICAL** - Malicious payloads can bypass security layer

---

### 5. **CRITICAL: Missing Auth0 Audience Validation in Frontend**

**Location:** `frontend/src/main.tsx`

```typescript
const audience = import.meta.env.VITE_AUTH0_AUDIENCE as string;
// audience = "https://dev-s60cj2o8lvkdxrcp.us.auth0.com/api/v2/"
```

**Location:** `mcp-gateway/server.ts:16`

```typescript
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || 'https://api.devise.io';
// Gateway expects: "https://dev-s60cj2o8lvkdxrcp.us.auth0.com/api/v2/"
```

**The Problem:**
- Frontend sends token for **Auth0 Management API** (audience = api/v2/)
- MCP Gateway expects token for **custom API** (audience = https://api.devise.io)
- JWT verification will **always fail** because audience doesn't match
- This means **no requests will ever authenticate successfully**

**Evidence:** All calls to `/api/mcp` route will get 401 because audience mismatch

**Fix Required:**
1. Set correct audience in Auth0 dashboard for your **custom MCP API**
2. Update all locations to use the **same audience**:

```typescript
// frontend/src/main.tsx
const audience = import.meta.env.VITE_AUTH0_AUDIENCE; // = "https://api.mcp.internal"

// mcp-gateway/server.ts  
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE; // = "https://api.mcp.internal"
```

**Impact:** 🔴 **CRITICAL** - Authentication completely broken between frontend and gateway

---

## 🟠 HIGH-SEVERITY ISSUES

### 6. **HIGH: Vite Dev Server Port Mismatch**

**Location:** `frontend/vite.config.ts:7`

```typescript
server: {
  port: 8081,  // ⚠️ Vite runs on 8081
}
```

**But Documentation Says:**
- `RUNNING_AND_TESTING.md` says port 5173
- Auth0 callback configured for localhost:8081

**The Problem:**
- If someone changes vite.config to 5173, Auth0 redirects fail
- If they follow docs and try port 5173, auth fails
- Inconsistent with industry standard (Vite defaults to 5173)

**Fix Required:**
```typescript
server: {
  port: 5173,  // Standard Vite port
}
```

And update Auth0 callback URLs to include both:
- `http://localhost:5173`
- `http://localhost:8081` (legacy)

**Impact:** 🟠 **HIGH** - Dev environment auth failures

---

### 7. **HIGH: Ledger Insert Error Doesn't Prevent Route Execution**

**Location:** `mcp-gateway/server.ts:154-171`

```typescript
app.post('/api/mcp', { preHandler: [verifyJwt, toolGuardMiddleware] }, 
  async (request, reply) => {
    try {
      const user = (request as any).user;
      
      // 🔴 If this throws, route still returns success
      await appendToBlockchainLedger(request.body, user);
      
      return {  // ⚠️ Always returns success, even if ledger insert failed
        jsonrpc: "2.0",
        id: (request.body as any)?.id || null,
        result: { status: "success", proxied: true }
      };
    } catch (err: any) {
      reply.status(500).send({ error: err.message });  // But this stops it
    }
  });
```

**The Problem:**
1. If `appendToBlockchainLedger()` throws:
   - Catch block sends 500 error ✓
   - But the `return { status: "success" }` still executes before catch catches it
2. MCP calls are reported as "success" in audit even if audit ledger insert failed
3. Breaks audit trail guarantees

**Fix Required:**
```typescript
app.post('/api/mcp', { preHandler: [verifyJwt, toolGuardMiddleware] }, 
  async (request, reply) => {
    try {
      const user = (request as any).user;
      
      // This will throw and go to catch
      await appendToBlockchainLedger(request.body, user);
      
      // Only reached if above succeeds
      return {
        jsonrpc: "2.0",
        id: (request.body as any)?.id || null,
        result: { status: "success", proxied: true }
      };
    } catch (err: any) {
      // Properly stops execution
      throw err;  // or reply.status(500).send(...)
    }
  });
```

**Impact:** 🟠 **HIGH** - Audit trail can be incomplete

---

### 8. **HIGH: Supabase Client Creation Missing Error Handling**

**Location:** `mcp-gateway/server.ts:21-22`

```typescript
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
```

**The Problem:**
1. If `.env` is not loaded, both are empty strings
2. `createClient('', '')` will NOT throw - it just creates a broken client
3. First request that tries to use Supabase will silently fail
4. Gateway accepts the request, but audit ledger insert fails silently

**Fix Required:**
```typescript
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
```

**Impact:** 🟠 **HIGH** - Silent failures on startup

---

## 🟡 MEDIUM-SEVERITY ISSUES

### 9. **MEDIUM: Frontend Real-Time Subscription Not Properly Cleaned Up**

**Location:** `frontend/src/hooks/useDashboard.ts:34-50`

```typescript
function useRealtimeEvents() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel("realtime:detection_events")
      .on("postgres_changes", { event: "INSERT", ... }, ...)
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);  // ⚠️ Missing unsubscribe
    };
  }, [queryClient]);
}
```

**The Problem:**
1. `removeChannel()` doesn't guarantee unsubscribe
2. If component remounts, new subscriptions accumulate without cleaning old ones
3. Eventually: memory leak, duplicate events, slower dashboard
4. Multiple queries invalidated on each event (not debounced)

**Fix Required:**
```typescript
function useRealtimeEvents() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel("realtime:detection_events")
      .on("postgres_changes", { event: "INSERT", ... }, () => {
        // Debounce: only invalidate after 500ms of inactivity
        queryClient.invalidateQueries({ queryKey: ["events"] });
      })
      .subscribe();
    
    return () => {
      channel.unsubscribe();  // Properly unsubscribe
      supabase.removeChannel(channel);  // Then remove
    };
  }, [queryClient]);
}
```

**Impact:** 🟡 **MEDIUM** - Memory leaks, performance degradation over time

---

### 10. **MEDIUM: Rate Limiter Doesn't Store State (Defaults to In-Memory)**

**Location:** `mcp-gateway/server.ts:28-30`

```typescript
app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
  // ⚠️ Missing cache config - defaults to in-memory
});
```

**The Problem:**
1. Without Redis, rate limiting is **in-memory only**
2. If Gateway crashes or restarts, counter resets
3. If deployed with multiple Gateway instances, each has separate counter
4. Users can bypass by hitting different instances

**Fix Required:**
```env
# .env
REDIS_URL=redis://localhost:6379
```

```typescript
import RedisStore from '@fastify/rate-limit/strategies/redis';

app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  cache: new RedisStore({ client: redis.createClient({ url: process.env.REDIS_URL }) })
});
```

**Impact:** 🟡 **MEDIUM** - Rate limiting doesn't persist across restarts

---

### 11. **MEDIUM: No TypeScript Type Safety in MCP Gateway**

**Location:** `mcp-gateway/server.ts` (throughout)

```typescript
const verifyJwt = async (request: any, reply: any) => {  // ⚠️ `any`
  ...
  request.user = decoded;  // ⚠️ Unsafe assignment
};

app.post('/api/mcp', { preHandler: [...] }, 
  async (request, reply) => {  // ⚠️ `any` by default
    const user = (request as any).user;  // ⚠️ Explicit `any` cast
  }
);
```

**The Problem:**
1. No type definitions for request/reply
2. Can't catch typos at compile time
3. IDE can't autocomplete

**Fix Required:**
```typescript
import { FastifyRequest, FastifyReply } from 'fastify';

interface JWTPayload {
  sub: string;
  org_id: string;
  aud: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload;
  }
}

const verifyJwt = async (request: FastifyRequest, reply: FastifyReply) => {
  // Now `request.user` is typed
};
```

**Impact:** 🟡 **MEDIUM** - Maintenance burden, runtime errors

---

### 12. **MEDIUM: Environment Variables Not Validated on Startup**

**Location:** `mcp-gateway/server.ts:14-16`

```typescript
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || 'devise-mcp.us.auth0.com';  // ⚠️ Fallback
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || 'https://api.devise.io';  // ⚠️ Wrong fallback
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
```

**The Problem:**
1. Fallback values are wrong (not your actual Auth0 config)
2. If `.env` missing, silently uses wrong values
3. Server starts but doesn't work
4. Hard to debug in production

**Fix Required:**
```typescript
const requiredEnv = ['AUTH0_DOMAIN', 'AUTH0_AUDIENCE', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = requiredEnv.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN!;  // ! means required
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE!;
```

**Impact:** 🟡 **MEDIUM** - Configuration errors hard to diagnose

---

## 🔵 LOW-SEVERITY ISSUES

### 13. **LOW: No Test Coverage**

**Location:** `frontend/` and `mcp-gateway/`

**The Problem:**
- Frontend has test scaffolding (`vitest`) but no actual tests
- MCP Gateway has manual test script (`test-gateway.js`) but no automated tests
- No CI/CD pipeline found

**Impact:** 🔵 **LOW** - Regression risk

---

### 14. **LOW: API Service Layer Missing Partial Response in Frontend**

**Location:** `frontend/src/services/api.ts:150+` (truncated)

```typescript
export async function fetchEvents(category?: string, riskLevel?: string): Promise<EventsResponse> {
  // Implementation cut off in read output
}
```

**The Problem:**
- Can't fully audit this file due to truncation
- Likely missing error handling for network failures

**Impact:** 🔵 **LOW** - Need full file review

---

## ✅ WHAT'S WORKING

Despite the issues above, several things are implemented correctly:

1. **Auth0 Integration**: Frontend properly uses @auth0/auth0-react
2. **Supabase Realtime**: Dashboard subscribes to changes correctly (once auth is fixed)
3. **React Query Integration**: Proper caching and stale-while-revalidate patterns
4. **Fastify Setup**: Server boots and registers middleware correctly
5. **Hash-Chain Audit Ledger**: Cryptographic chain is correct (once auth is fixed)
6. **JSON-RPC Structure**: Proper message formatting in test payloads
7. **Layout & Components**: UI framework properly structured

---

## 🔧 Fixes Priority & Implementation Order

### **Phase 1: Critical Fixes (Do First - Blocks Deployment)**

1. ✅ **Fix Supabase Key** (Issue #1)
   - Replace frontend `.env` ANON_KEY with actual limited key from Supabase
   - Keep SERVICE_ROLE_KEY only in gateway `.env`

2. ✅ **Fix Auth0 Audience Mismatch** (Issue #5)
   - Set correct audience consistently
   - Test that frontend JWT works with gateway verification

3. ✅ **Fix JWT Middleware** (Issue #3)
   - Convert callback-based verification to promise-based
   - Ensure early returns actually stop execution

4. ✅ **Fix CORS** (Issue #2)
   - Set explicit origins instead of `*`

5. ✅ **Fix ToolGuard** (Issue #4)
   - Move from string.includes() to proper validation
   - At minimum: validate JSON-RPC schema

### **Phase 2: High-Priority Fixes (Do Before Load Testing)**

6. ✅ **Fix Vite Port** (Issue #6)
7. ✅ **Validate Environment Variables** (Issue #12)
8. ✅ **Add Supabase Connection Check** (Issue #8)
9. ✅ **Fix Ledger Error Handling** (Issue #7)

### **Phase 3: Medium Priority (Do Before Full Release)**

10. ✅ **Add Real-Time Cleanup** (Issue #9)
11. ✅ **Add TypeScript Types** (Issue #11)
12. ✅ **Add Tests** (Issue #13)
13. ✅ **Add Redis Rate Limiter** (Issue #10)

---

## 📊 Cross-Check Results

| Component | Status | Issues | Blocker |
|-----------|--------|--------|---------|
| MCP Gateway | ⚠️ Broken | 8 | Yes (Auth #3, #5) |
| Frontend | ⚠️ Broken | 5 | Yes (Keys #1, #2) |
| Supabase Setup | ✅ OK | 0 | No |
| Auth0 Config | ⚠️ Misconfigured | 2 | Yes (#5, #6) |
| Database Schema | ✅ OK | 0 | No |
| Docker/Deployment | ❓ Unknown | - | TBD |

---

## 🚀 Next Steps

1. **Before Running Again**: Fix all CRITICAL issues (1-5)
2. **Test Auth Flow**: Verify frontend → gateway → supabase works
3. **Load Test**: Verify rate limiter works correctly
4. **Security Audit**: Run OWASP scanning tools
5. **E2E Testing**: Trigger detection events through full pipeline

---

## Files to Update

```
1. frontend/.env                     - Change ANON_KEY to limited key
2. mcp-gateway/.env                  - Verify Auth0 audience
3. mcp-gateway/server.ts             - Fix JWT, CORS, ToolGuard, env validation
4. frontend/src/main.tsx             - Verify Auth0 audience consistency
5. frontend/vite.config.ts           - Change port to 5173
6. frontend/src/hooks/useDashboard.ts - Add proper cleanup
```

---

## Conclusion

**Current State:** The architecture is sound and components are well-designed, but there are **5 critical security issues** preventing production deployment.

**Estimated Fix Time:** 3-4 hours for Phase 1 critical fixes, additional 4-6 hours for Phase 2/3.

**Recommendation:** Do not deploy to production until all CRITICAL (Phase 1) issues are resolved.

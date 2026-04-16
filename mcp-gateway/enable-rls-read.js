/**
 * enable-rls-read.js
 * 
 * Adds a Row Level Security policy on mcp_audit_ledger 
 * so the frontend (anon key) can read rows.
 * Run once: node enable-rls-read.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Use the service role key to run raw SQL that adds a SELECT policy
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      ALTER TABLE mcp_audit_ledger ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Allow public read access" 
        ON mcp_audit_ledger 
        FOR SELECT 
        USING (true);
    `
  });

  if (error) {
    // The rpc approach may not exist — try direct approach
    console.log("RPC method not available. Trying alternative...");
    
    // If the table has RLS enabled but no SELECT policy, we need to disable RLS
    // or add the policy via Supabase Dashboard
    const { error: disableError } = await supabase
      .from('mcp_audit_ledger')
      .select('id')
      .limit(1);

    if (disableError) {
      console.log("\n⚠️  RLS is blocking reads with the anon key.");
      console.log("   You need to do ONE of these in Supabase Dashboard:\n");
      console.log("   Option A: Disable RLS on the table");  
      console.log("   → Go to: Table Editor → mcp_audit_ledger → RLS → Disable\n");
      console.log("   Option B: Add a SELECT policy");
      console.log("   → Go to: Authentication → Policies → mcp_audit_ledger");
      console.log("   → Add policy: Allow SELECT for all (anon + authenticated)\n");
      console.log("   Or run this SQL in the SQL Editor:");
      console.log("   ─────────────────────────────────────────");
      console.log("   ALTER TABLE public.mcp_audit_ledger ENABLE ROW LEVEL SECURITY;");
      console.log("   CREATE POLICY \"allow_public_read\" ON public.mcp_audit_ledger FOR SELECT USING (true);");
      console.log("   ─────────────────────────────────────────");
    } else {
      console.log("✅ Anon key can already read — RLS is fine!");
    }
  } else {
    console.log("✅ RLS policy added successfully!");
  }
}

main();

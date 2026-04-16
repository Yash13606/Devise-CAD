require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function check() {
  const { data, error } = await supabase.from('mcp_audit_ledger').select('*').limit(5);
  if (error) {
    console.log("DB ERROR:", error);
  } else {
    console.log("Found rows:", data.length);
    console.log("Rows:", JSON.stringify(data, null, 2));
  }
}

check();

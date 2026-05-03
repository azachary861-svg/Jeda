#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runMigration(migrationFile) {
  try {
    const sql = fs.readFileSync(migrationFile, 'utf-8');
    
    console.log(`📝 Deploying migration: ${path.basename(migrationFile)}`);
    
    // Split SQL into statements and execute
    const { data, error } = await supabase.rpc('exec', { sql });
    
    if (error) {
      console.error('❌ Migration failed:', error.message);
      return false;
    }
    
    console.log('✅ Migration deployed successfully');
    return true;
  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

async function main() {
  const migrationDir = path.join(__dirname, '../supabase/migrations');
  const migrationFile = process.argv[2] || path.join(migrationDir, '202605030001_advanced_modules.sql');
  
  const success = await runMigration(migrationFile);
  process.exit(success ? 0 : 1);
}

main();

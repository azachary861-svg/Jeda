#!/usr/bin/env python3
import os
import sys
import requests
from pathlib import Path

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    print("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

def deploy_migration(migration_file):
    try:
        with open(migration_file, 'r') as f:
            sql = f.read()
        
        print(f"📝 Deploying migration: {Path(migration_file).name}")
        
        # Use Supabase REST API to execute SQL
        headers = {
            'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
            'Content-Type': 'application/json'
        }
        
        # Call the pgrest API to execute SQL
        # Note: Direct SQL execution via pgrest isn't typical. We'll use the rpc endpoint
        # if a stored procedure exists, or fall back to direct PostgreSQL connection
        
        # For now, try using the direct SQL endpoint (if available)
        api_url = f"{SUPABASE_URL}/rest/v1/rpc/execute_sql"
        
        payload = {'sql': sql}
        
        response = requests.post(api_url, json=payload, headers=headers)
        
        if response.status_code == 200:
            print("✅ Migration deployed successfully")
            return True
        else:
            print(f"❌ Migration failed: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as err:
        print(f"❌ Error: {err}")
        return False

if __name__ == '__main__':
    migration_file = sys.argv[1] if len(sys.argv) > 1 else '../supabase/migrations/202605030001_advanced_modules.sql'
    
    success = deploy_migration(migration_file)
    sys.exit(0 if success else 1)

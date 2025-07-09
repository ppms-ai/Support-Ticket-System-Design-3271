import { createClient } from '@supabase/supabase-js'

// Project ID will be auto-injected during deployment
const SUPABASE_URL = 'https://bqcrrkzitjjfjqwwnynz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxY3Jya3ppdGpqZmpxd3dueW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODg1MjEsImV4cCI6MjA2NzY2NDUyMX0.Pw9bGwMcoX3TkBMD3W4Egr12WLfB93Tox1weyrStBsU'

if(SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

export default createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})
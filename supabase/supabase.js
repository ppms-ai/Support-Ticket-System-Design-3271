import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bqcrrkzitjjfjqwwnynz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxY3Jya3ppdGpqZmpxd3dueW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODg1MjEsImV4cCI6MjA2NzY2NDUyMX0.Pw9bGwMcoX3TkBMD3W4Egr12WLfB93Tox1weyrStBsU'

export const supabase = createClient(supabaseUrl, supabaseKey)

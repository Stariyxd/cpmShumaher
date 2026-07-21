import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxitfyaodawjeqhzwiue.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4aXRmeWFvZGF3amVxaHp3aXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjkxNjAsImV4cCI6MjEwMDIwNTE2MH0.2zPcxgGYUpMfpNh3E-X10KD1Bls_M1b4cfQr1CPkjBk'

export const supabase = createClient(supabaseUrl, supabaseKey)
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ceabcnrhflgfuazysvsi.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYWJjbnJoZmxnZnVhenlzdnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTAxNDksImV4cCI6MjA3NzMyNjE0OX0.4XPFfSBUta2L7ZdM69JWwukK8mHEzzu1xl58LEkZHj0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

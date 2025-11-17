import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://eunlyrrfkwwkxcjcnrnd.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bmx5cnJma3d3a3hjamNucm5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NTU1NTAsImV4cCI6MjA3NzEzMTU1MH0.xdMhynzsKrtxHc3Sd68j21Z6lf3h38439zYAzUr-r-c";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

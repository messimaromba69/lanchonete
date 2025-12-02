import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://eunlyrrfkwwkxcjcnrnd.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bmx5cnJma3d3a3hjamNucm5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NTU1NTAsImV4cCI6MjA3NzEzMTU1MH0.xdMhynzsKrtxHc3Sd68j21Z6lf3h38439zYAzUr-r-c";

// Cria o cliente Supabase também configurado para persistir sessão no
// localStorage. Isso permite que diferentes módulos do app (que importam
// este arquivo) leiam o token de sessão e enviem o Authorization header
// automaticamente, evitando 401 em operações autenticadas (ex: upsert).
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

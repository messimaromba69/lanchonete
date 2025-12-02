// Re-export the single Supabase client implementation from the src integrations
// so the entire app uses the same instance and we avoid multiple GoTrueClient
// instances (which can cause undefined behavior when sharing storage keys).
import { supabase as client } from "../src/integrations/supabase/client";

export const supabase = client;

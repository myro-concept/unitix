import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = "https://opbjhmyprbiddtcwksip.supabase.co";
const supabaseAnonKey =
  "sb_publishable_mkxLLnw3glWLk-TY1Y71WQ_kQenUOxt";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
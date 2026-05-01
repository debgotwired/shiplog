import { createClient } from "@supabase/supabase-js";

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== "false" || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createBrowserSupabase = () => {
  if (isDemoMode) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
};

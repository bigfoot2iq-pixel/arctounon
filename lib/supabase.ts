import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client. Uses the service-role key, so it must NEVER be
// imported into a client component — only from Route Handlers (app/api/**).
// The service role bypasses row-level security, which is why the arc_allowlist
// table can stay locked to anon/public access.

export const ARC_ALLOWLIST_TABLE = "arc_allowlist";

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

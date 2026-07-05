// Exports the Supabase admin client, created with the service-role key.
// This client bypasses Row Level Security, so it must ONLY ever run on the server —
// never ship the service key to the browser.

import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Single admin client used for generating signed storage URLs and other server-side ops.
export const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceKey,
  {
    auth: {
      // We manage our own JWT auth; the Supabase client should not persist sessions.
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Name of the private storage bucket that holds all loan documents.
export const DOCUMENTS_BUCKET = "loan-documents";

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The anon key is meant to be public. The database rules (RLS) are what
// keep your data safe, so visitors can only read content.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

// Turns an image path stored in the database into a full URL.
export function imageUrl(path) {
  if (!path) return null;
  if (/^(https?:)?\/\//.test(path) || path.startsWith("/")) return path;
  return supabase.storage.from("portfolio").getPublicUrl(path).data.publicUrl;
}

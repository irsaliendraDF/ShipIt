/**
 * Supabase browser client for ShipIt.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from the
 * environment. Both vars are intentionally `NEXT_PUBLIC_*` because the anon
 * key is designed to be exposed in the browser bundle, with RLS policies
 * doing the real access control (see supabase/migrations).
 *
 * If the env vars are missing (e.g. local dev without a `.env.local`), this
 * module returns `null` instead of throwing. Callers should guard with
 * `if (!supabase) ...` and fall back gracefully so the site stays buildable
 * even when Supabase isn't configured yet.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      intake_submissions: {
        Row: IntakeSubmissionRow;
        Insert: IntakeSubmissionInsert;
        Update: Partial<IntakeSubmissionInsert>;
        Relationships: [];
      };
      remixes: {
        Row: RemixRow;
        Insert: RemixInsert;
        Update: Partial<RemixInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type IntakeSubmissionRow = {
  id: string;
  created_at: string;
  name: string;
  company: string;
  email: string;
  kind: 'single' | 'bundle' | 'subscription' | 'custom';
  tools: string[];
  business: string;
  contents: string;
  branding: 'ready' | 'mostly' | 'help';
  timeline: 'asap' | '2-3-weeks' | 'flexible';
  notes: string | null;
};

export type IntakeSubmissionInsert = Omit<IntakeSubmissionRow, 'id' | 'created_at'>;

export type RemixRow = {
  id: string;
  created_at: string;
  parent_slug: string;
  child_slug: string;
  child_contributor: string | null;
  note: string | null;
};

export type RemixInsert = Omit<RemixRow, 'id' | 'created_at'>;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient<Database> | null =
  url && anonKey ? createClient<Database>(url, anonKey) : null;

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

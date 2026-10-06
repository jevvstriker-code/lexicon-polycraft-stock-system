import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';

export const SCHEMA_NAME = 'lexicon_polycraft_app';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createBrowserClient<Database, typeof SCHEMA_NAME>(
    supabaseUrl,
    supabaseAnonKey,
    {
      db: {
        schema: SCHEMA_NAME,
      },
    }
  );
}

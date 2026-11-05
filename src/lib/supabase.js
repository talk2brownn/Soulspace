import { createClient } from '@supabase/supabase-js';

// These come from a .env file (see .env.example). The anon key is safe to
// ship in the browser ONLY because every table has Row Level Security on.
// Never put the service_role key here.
const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isCloudConfigured = Boolean(url && anonKey);

export const supabase = isCloudConfigured ? createClient(url, anonKey) : null;

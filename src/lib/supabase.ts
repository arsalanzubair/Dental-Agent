import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export const APPOINTMENTS_TABLE = import.meta.env.SUPABASE_APPOINTMENTS_TABLE || 'appointments';

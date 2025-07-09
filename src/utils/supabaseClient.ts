import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lrsffguycbuvzrjzevsm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Configuration:');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? '✅ Present' : '❌ Missing');

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is missing from environment variables');
  throw new Error('Missing Supabase URL. Please check your .env file.');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is missing from environment variables');
  console.error('📝 Please add VITE_SUPABASE_ANON_KEY to your .env file');
  console.error('🔗 Get your anon key from: https://supabase.com/dashboard/project/lrsffguycbuvzrjzevsm/settings/api');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || '');

// Test connection on initialization
if (supabaseAnonKey) {
  supabase.from('students').select('count').limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Supabase connection failed:', error.message);
        console.error('🔍 Please check:');
        console.error('  - Your Supabase anon key is correct');
        console.error('  - Database tables exist');
        console.error('  - RLS policies are configured');
      } else {
        console.log('✅ Supabase connected successfully');
      }
    })
    .catch(err => {
      console.error('❌ Supabase connection error:', err);
    });
} else {
  console.warn('⚠️ Skipping connection test - no anon key provided');
}
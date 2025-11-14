import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function getServerSupabaseClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options) {
        cookieStore.set({ name, value: '', ...options });
      },
    },
  });
}

export async function fetchRestaurantOnboardingSummary() {
  const supabase = await getServerSupabaseClient();
  // Placeholder query for future SSR data fetching
  await supabase.from('restaurants').select('id').limit(1);
  return [];
}

export async function fetchRequestsSummary() {
  const supabase = await getServerSupabaseClient();
  await supabase.from('requests').select('id').limit(1);
  return [];
}

import { supabase } from '../lib/supabase';

export type PromoCodeRow = {
  id: string;
  code: string;
  discount_type: 'percentage'|'fixed';
  discount_value: number;
  is_active: boolean;
  expiry_date?: string | null;
  usage_count: number;
  max_usage?: number | null;
};

export async function listPromoCodes() {
  const { data, error } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as PromoCodeRow[];
}

// Attempts to increment usage via RPC first, fallbacks to update
export async function incrementPromoUsage(id: string) {
  try {
    const { error } = await supabase.rpc('increment_promo_usage', { pid: id });
    if (error) throw error;
  } catch (_e) {
    // Fallback: fetch current and update
    const { data, error } = await supabase.from('promo_codes').select('usage_count').eq('id', id).single();
    if (error) throw error;
    const current = (data as any)?.usage_count ?? 0;
    const { error: updErr } = await supabase.from('promo_codes').update({ usage_count: current + 1 }).eq('id', id);
    if (updErr) throw updErr;
  }
}

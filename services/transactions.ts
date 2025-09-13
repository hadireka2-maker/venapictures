import { supabase } from '../lib/supabase';

export type TransactionRow = {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: string;
  amount: number;
  type: 'INCOME'|'EXPENSE';
  method?: string | null;
  card_id?: string | null;
  pocket_id?: string | null;
  project_id?: string | null;
};

export async function listTransactions(params?: { dateFrom?: string; dateTo?: string }) {
  let q = supabase.from('transactions').select('*');
  if (params?.dateFrom) q = q.gte('date', params.dateFrom);
  if (params?.dateTo) q = q.lte('date', params.dateTo);
  q = q.order('date', { ascending: false });
  const { data, error } = await q;
  if (error) throw error;
  return data as TransactionRow[];
}

export async function createTransaction(payload: TransactionRow) {
  const { error } = await supabase.from('transactions').insert(payload);
  if (error) throw error;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

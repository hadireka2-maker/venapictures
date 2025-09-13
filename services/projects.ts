import { supabase } from '../lib/supabase';

export type ProjectRow = {
  id: string;
  project_name: string;
  client_id?: string | null;
  client_name?: string | null;
  project_type?: string | null;
  package_id?: string | null;
  package_name?: string | null;
  date?: string | null; // YYYY-MM-DD
  location?: string | null;
  progress: number;
  status: string; // 'Dikonfirmasi', 'Selesai', etc
  booking_status?: 'BARU'|'DIKONFIRMASI'|'SELESAI'|'DIBATALKAN';
  total_cost: number;
  amount_paid: number;
  payment_status: 'BELUM_BAYAR'|'DP_TERBAYAR'|'LUNAS';
  notes?: string | null;
  dp_proof_url?: string | null;
  promo_code_id?: string | null;
  discount_amount?: number | null;
  transport_cost?: number | null;
  completed_digital_items?: string[];
};

export async function listProjects() {
  const { data, error } = await supabase.from('projects').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data as ProjectRow[];
}

export async function createProject(payload: ProjectRow) {
  const { error } = await supabase.from('projects').insert(payload);
  if (error) throw error;
}

export async function updateProject(id: string, patch: Partial<ProjectRow>) {
  const { error } = await supabase.from('projects').update(patch).eq('id', id);
  if (error) throw error;
}

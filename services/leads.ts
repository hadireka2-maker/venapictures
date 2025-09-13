import { supabase } from '../lib/supabase';

export type LeadRow = {
  id: string;
  vendor_id?: string;
  name: string;
  contact_channel: 'WhatsApp'|'Instagram'|'Website'|'Telepon'|'Referral'|'Saran'|'Lainnya';
  location?: string | null;
  whatsapp?: string | null;
  notes?: string | null;
  status: 'Sedang Diskusi'|'Menunggu Follow Up'|'Dikonversi'|'Ditolak';
  date: string; // ISO
};

export async function listLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data as LeadRow[];
}

export async function createLead(payload: LeadRow) {
  const { error } = await supabase.from('leads').insert(payload);
  if (error) throw error;
}

export async function updateLead(id: string, patch: Partial<LeadRow>) {
  const { error } = await supabase.from('leads').update(patch).eq('id', id);
  if (error) throw error;
}

import { supabase } from '../lib/supabase';

export type ClientRow = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  client_type?: string | null;
  since?: string | null; // YYYY-MM-DD
  status: 'ACTIVE'|'INACTIVE';
  last_contact?: string | null; // ISO
  portal_access_id?: string | null; // uuid string
};

export async function listClients() {
  const { data, error } = await supabase.from('clients').select('*').order('since', { ascending: false });
  if (error) throw error;
  return data as ClientRow[];
}

export async function createClient(payload: ClientRow) {
  const { error } = await supabase.from('clients').insert(payload);
  if (error) throw error;
}

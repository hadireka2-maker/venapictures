export type EntityBase = {
  id: string;
  org_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type ListOptions = {
  status?: string;
  orderBy?: { column: string; ascending?: boolean }[];
  limit?: number;
  offset?: number;
};

import { supabase } from '../lib/supabaseClient';

export function createCrudService<T extends EntityBase>(table: string) {
  return {
    async list(orgId: string, opts: ListOptions = {}): Promise<T[]> {
      let query = supabase.from(table).select('*').eq('org_id', orgId);

      if (opts.status) query = query.eq('status', opts.status);
      if (opts.orderBy?.length) {
        for (const o of opts.orderBy) {
          query = query.order(o.column as any, { ascending: o.ascending ?? false });
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }
      if (opts.limit) query = query.limit(opts.limit);
      if (opts.offset) query = query.range(opts.offset, (opts.offset || 0) + (opts.limit || 100) - 1);

      const { data, error } = await query;
      if (error) throw error;
      return (data as T[]) ?? [];
    },

    async getById(id: string): Promise<T> {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return data as T;
    },

    async create(payload: Partial<T>): Promise<T> {
      const { data, error } = await supabase.from(table).insert(payload).select('*').single();
      if (error) throw error;
      return data as T;
    },

    async update(id: string, patch: Partial<T>): Promise<T> {
      const { data, error } = await supabase.from(table).update(patch).eq('id', id).select('*').single();
      if (error) throw error;
      return data as T;
    },

    async remove(id: string): Promise<{ id: string }> {
      const { data, error } = await supabase.from(table).delete().eq('id', id).select('id').single();
      if (error) throw error;
      return data as { id: string };
    },

    subscribe(orgId: string, handler: (event: 'insert' | 'update' | 'delete', row: any, payload: any) => void) {
      const channel = supabase
        .channel(`${table}:org:${orgId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table, filter: `org_id=eq.${orgId}` }, (payload) => {
          const event = payload.eventType.toLowerCase() as 'insert' | 'update' | 'delete';
          const row = event === 'delete' ? payload.old : payload.new;
          handler(event, row, payload);
        })
        .subscribe();
      return () => supabase.removeChannel(channel);
    },
  };
}


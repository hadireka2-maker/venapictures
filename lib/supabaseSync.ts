import { supabase } from './supabaseClient'
import type React from 'react'
import type { VendorData, User } from '../types'
import { MOCK_DATA, MOCK_USERS } from '../constants'

// Generic helpers to mirror React state arrays into Supabase tables
export type ArrayUpdater<T> = T[] | ((prev: T[]) => T[])

async function syncTableToSupabase<T extends { id: string }>(table: string, newRows: T[]): Promise<void> {
  try {
    // Fetch existing ids to compute deletions
    const { data: existing, error: selErr } = await supabase.from(table).select('id')
    if (selErr) {
      console.warn(`[Supabase] select ids failed for ${table}:`, selErr)
    }
    const existingIds = new Set((existing ?? []).map((r: any) => r.id))
    const newIds = new Set(newRows.map(r => r.id))

    // Delete rows not present
    const toDelete = [...existingIds].filter(id => !newIds.has(id))
    if (toDelete.length) {
      const { error: delErr } = await supabase.from(table).delete().in('id', toDelete)
      if (delErr) console.warn(`[Supabase] delete failed for ${table}:`, delErr)
    }

    // Upsert current rows as { id, data }
    if (newRows.length) {
      const payload = newRows.map(r => ({ id: (r as any).id, data: r }))
      const { error: upErr } = await supabase.from(table).upsert(payload as any, { onConflict: 'id' })
      if (upErr) console.warn(`[Supabase] upsert failed for ${table}:`, upErr)
    }
  } catch (e) {
    console.warn(`[Supabase] sync error for ${table}:`, e)
  }
}

export function createSyncedArraySetter<T extends { id: string }>(table: string, setState: React.Dispatch<React.SetStateAction<T[]>>) {
  return (next: ArrayUpdater<T>) => {
    setState(prev => {
      const nextVal = typeof next === 'function' ? (next as (p: T[]) => T[])(prev) : next
      // Fire-and-forget Supabase sync; state updates immediately for UX
      void syncTableToSupabase<T>(table, nextVal)
      return nextVal
    })
  }
}

export function createSyncedObjectSetter<T extends { id: string }>(table: string, setState: React.Dispatch<React.SetStateAction<T>>) {
  return (next: React.SetStateAction<T>) => {
    setState(prev => {
      const nextVal = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
      void (async () => {
        const payload = { id: (nextVal as any).id, data: nextVal }
        const { error } = await supabase.from(table).upsert(payload as any, { onConflict: 'id' })
        if (error) console.warn(`[Supabase] upsert failed for ${table}:`, error)
      })()
      return nextVal
    })
  }
}

// Load from Supabase; if empty, seed from mock and return the seeded data
export async function initializeAndLoadAll(): Promise<{ users: User } & VendorData> {
  // Helper to load or seed a single table
  async function loadOrSeedTable<T>(table: string, seedData: T[]): Promise<T[]> {
    const { data, error } = await supabase.from(table).select('id, data')
    if (!error && data && data.length > 0) return (data as any[]).map(r => r.data as T)
    if (error) console.warn(`[Supabase] select failed for ${table}:`, error)
    // Seed as { id, data }
    if (seedData.length > 0) {
      const payload = seedData.map((d: any) => ({ id: d.id, data: d }))
      const { error: insErr } = await supabase.from(table).insert(payload as any)
      if (insErr) console.warn(`[Supabase] seed insert failed for ${table}:`, insErr)
    }
    // Load again
    const { data: data2, error: error2 } = await supabase.from(table).select('id, data')
    if (error2) console.warn(`[Supabase] reload after seed failed for ${table}:`, error2)
    return ((data2 ?? []) as any[]).map(r => r.data as T)
  }

  // Seed/load all entities (keep names aligned with schema.sql)
  const [
    users,
    profileArr,
    clients,
    teamMembers,
    packages,
    addOns,
    projects,
    transactions,
    cards,
    pockets,
    leads,
    notifications,
    sops,
    promoCodes,
    socialMediaPosts,
    assets,
    clientFeedback,
    contracts,
    teamProjectPayments,
    teamPaymentRecords,
    rewardLedgerEntries
  ] = await Promise.all([
    loadOrSeedTable<User>('users', []),
    loadOrSeedTable('profiles', [MOCK_DATA.profile]),
    loadOrSeedTable('clients', MOCK_DATA.clients),
    loadOrSeedTable('team_members', MOCK_DATA.teamMembers),
    loadOrSeedTable('packages', MOCK_DATA.packages),
    loadOrSeedTable('add_ons', MOCK_DATA.addOns),
    loadOrSeedTable('projects', MOCK_DATA.projects),
    loadOrSeedTable('transactions', MOCK_DATA.transactions),
    loadOrSeedTable('cards', MOCK_DATA.cards),
    loadOrSeedTable('financial_pockets', MOCK_DATA.pockets),
    loadOrSeedTable('leads', MOCK_DATA.leads),
    loadOrSeedTable('notifications', MOCK_DATA.notifications),
    loadOrSeedTable('sops', MOCK_DATA.sops),
    loadOrSeedTable('promo_codes', MOCK_DATA.promoCodes),
    loadOrSeedTable('social_media_posts', MOCK_DATA.socialMediaPosts),
    loadOrSeedTable('assets', MOCK_DATA.assets),
    loadOrSeedTable('client_feedback', MOCK_DATA.clientFeedback),
    loadOrSeedTable('contracts', MOCK_DATA.contracts),
    loadOrSeedTable('team_project_payments', MOCK_DATA.teamProjectPayments),
    loadOrSeedTable('team_payment_records', MOCK_DATA.teamPaymentRecords),
    loadOrSeedTable('reward_ledger_entries', MOCK_DATA.rewardLedgerEntries),
  ])

  return {
    users: users as any,
    profile: (profileArr as any)[0] ?? MOCK_DATA.profile,
    clients: clients as any,
    teamMembers: teamMembers as any,
    packages: packages as any,
    addOns: addOns as any,
    projects: projects as any,
    transactions: transactions as any,
    cards: cards as any,
    pockets: pockets as any,
    leads: leads as any,
    notifications: notifications as any,
    sops: sops as any,
    promoCodes: promoCodes as any,
    socialMediaPosts: socialMediaPosts as any,
    assets: assets as any,
    clientFeedback: clientFeedback as any,
    contracts: contracts as any,
    teamProjectPayments: teamProjectPayments as any,
    teamPaymentRecords: teamPaymentRecords as any,
    rewardLedgerEntries: rewardLedgerEntries as any,
  }
}


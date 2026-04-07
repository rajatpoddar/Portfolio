import { supabase } from './supabase';

// ─── CLIENTS ─────────────────────────────────────────────────────────────────
export const clientsDb = {
  getAll: () => supabase.from('clients').select('*').order('created_at', { ascending: false }),

  create: (data) => supabase.from('clients').insert([data]).select().single(),

  update: (id, data) => supabase.from('clients').update(data).eq('id', id).select().single(),

  delete: (id) => supabase.from('clients').delete().eq('id', id),
};

// ─── QUOTATIONS ───────────────────────────────────────────────────────────────
export const quotationsDb = {
  getAll: () =>
    supabase
      .from('quotations')
      .select('*, clients(name, business)')
      .order('created_at', { ascending: false }),

  getById: (id) =>
    supabase.from('quotations').select('*, clients(name, business)').eq('id', id).single(),

  create: (data) => supabase.from('quotations').insert([data]).select().single(),

  update: (id, data) => supabase.from('quotations').update(data).eq('id', id).select().single(),

  delete: (id) => supabase.from('quotations').delete().eq('id', id),

  duplicate: async (id) => {
    const { data: original } = await supabase.from('quotations').select('*').eq('id', id).single();
    if (!original) return { error: 'Not found' };
    const { id: _id, created_at: _ca, quote_number: _qn, ...rest } = original;
    const newQuote = {
      ...rest,
      quote_number: `QT-${Date.now().toString().slice(-6)}`,
      status: 'draft',
    };
    return supabase.from('quotations').insert([newQuote]).select().single();
  },
};

// ─── INVOICES ─────────────────────────────────────────────────────────────────
export const invoicesDb = {
  getAll: () =>
    supabase
      .from('invoices')
      .select('*, clients(name, business)')
      .order('created_at', { ascending: false }),

  getById: (id) =>
    supabase.from('invoices').select('*, clients(name, business)').eq('id', id).single(),

  create: (data) => supabase.from('invoices').insert([data]).select().single(),

  update: (id, data) => supabase.from('invoices').update(data).eq('id', id).select().single(),

  delete: (id) => supabase.from('invoices').delete().eq('id', id),
};

// ─── LEADS (public form submissions) ─────────────────────────────────────────
export const leadsDb = {
  create: (data) => supabase.from('leads').insert([data]).select().single(),

  getAll: () => supabase.from('leads').select('*').order('created_at', { ascending: false }),

  update: (id, data) => supabase.from('leads').update(data).eq('id', id),
};

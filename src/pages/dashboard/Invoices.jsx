import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { invoicesDb, clientsDb } from '../../lib/db';
import { exportInvoicePDF } from '../../services/pdfService';
import { useToast } from '../../components/ui/Toast';

const STATUS_COLORS = {
  draft: '#6b6b80', sent: '#00d4ff', paid: '#10b981', pending: '#f59e0b', overdue: '#ef4444',
};

let invoiceCounter = null;
function nextInvoiceNumber(existing) {
  if (invoiceCounter !== null) return `INV-${String(++invoiceCounter).padStart(4, '0')}`;
  const nums = existing.map((i) => parseInt(i.invoice_number?.replace('INV-', '') || '0')).filter(Boolean);
  invoiceCounter = nums.length ? Math.max(...nums) : 0;
  return `INV-${String(++invoiceCounter).padStart(4, '0')}`;
}

function InvoiceModal({ invoice, clients, existingInvoices, onSave, onClose }) {
  const toast = useToast();
  const [form, setForm] = useState(invoice || {
    client_id: '', invoice_number: nextInvoiceNumber(existingInvoices),
    project_name: '', total_amount: '', paid_amount: '0',
    discount_type: 'flat', discount_value: '0',
    due_date: '', status: 'draft', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const totalAmt = Number(form.total_amount || 0);
  const discVal  = Number(form.discount_value || 0);
  const discAmt  = form.discount_type === 'percent'
    ? Math.round(totalAmt * discVal / 100)
    : discVal;
  const afterDiscount = Math.max(0, totalAmt - discAmt);
  const dueAmount = Math.max(0, afterDiscount - Number(form.paid_amount || 0));

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      total_amount: totalAmt,
      discount_amount: discAmt,
      paid_amount: Number(form.paid_amount),
      due_amount: dueAmount,
    };
    if (invoice?.id) {
      await invoicesDb.update(invoice.id, payload);
    } else {
      await invoicesDb.create(payload);
    }
    setSaving(false);
    toast(invoice ? 'Invoice updated' : 'Invoice created', 'success');
    onSave();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,8,0.88)', backdropFilter: 'blur(12px)' }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto glass rounded-2xl border border-white/10">
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <div className="font-bold">{invoice ? 'Edit Invoice' : 'New Invoice'}</div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 cursor-pointer text-sm">✕</button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {/* Invoice number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Invoice Number</label>
            <div className="bg-white/[0.02] border border-white/8 rounded-xl px-4 py-2.5 text-sm font-mono text-[#6c63ff]">{form.invoice_number}</div>
          </div>
          {/* Client */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Client <span className="text-[#6c63ff]">*</span></label>
            <select value={form.client_id} onChange={set('client_id')}
              className="bg-[#0d0d14] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6c63ff]/50 transition-colors">
              <option value="">— Select client —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.business ? ` (${c.business})` : ''}</option>)}
            </select>
          </div>
          {/* Project */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Project / Description</label>
            <input value={form.project_name} onChange={set('project_name')} placeholder="e.g. E-Commerce Platform"
              className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6c63ff]/50 transition-colors" />
          </div>
          {/* Total + Paid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Total Amount (₹)</label>
              <input type="number" value={form.total_amount} onChange={set('total_amount')} placeholder="50000"
                className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6c63ff]/50 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Paid Amount (₹)</label>
              <input type="number" value={form.paid_amount} onChange={set('paid_amount')} placeholder="25000"
                className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6c63ff]/50 transition-colors" />
            </div>
          </div>
          {/* Discount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Discount</label>
            <div className="flex gap-2">
              <select value={form.discount_type} onChange={set('discount_type')}
                className="bg-[#0d0d14] border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#6c63ff]/50 transition-colors w-28">
                <option value="flat">₹ Flat</option>
                <option value="percent">% Percent</option>
              </select>
              <input type="number" value={form.discount_value} onChange={set('discount_value')}
                placeholder={form.discount_type === 'percent' ? '10' : '5000'}
                className="flex-1 bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6c63ff]/50 transition-colors" />
            </div>
          </div>
          {/* Live calculation */}
          <div className="rounded-xl bg-white/[0.03] border border-white/8 p-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-white/50">
              <span>Project Amount</span><span>₹{totalAmt.toLocaleString('en-IN')}</span>
            </div>
            {discAmt > 0 && (
              <div className="flex justify-between text-red-400/70">
                <span>Discount {form.discount_type === 'percent' ? `(${discVal}%)` : ''}</span>
                <span>-₹{discAmt.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-white/50">
              <span>After Discount</span><span>₹{afterDiscount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-white/50">
              <span>Paid</span><span>₹{Number(form.paid_amount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t border-white/8 pt-2 flex justify-between font-bold">
              <span>Amount Due</span>
              <span className={dueAmount > 0 ? 'text-[#f59e0b]' : 'text-[#10b981]'}>
                ₹{dueAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          {/* Due date + status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Due Date</label>
              <input type="date" value={form.due_date} onChange={set('due_date')}
                className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6c63ff]/50 transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Status</label>
              <select value={form.status} onChange={set('status')}
                className="bg-[#0d0d14] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6c63ff]/50 transition-colors">
                {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Payment terms, bank details..."
              className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6c63ff]/50 transition-colors resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl glass border border-white/10 text-sm font-medium cursor-pointer">Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSave} disabled={saving || !form.client_id}
            className="flex-1 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#7c73ff] text-sm font-semibold disabled:opacity-50 cursor-pointer transition-colors">
            {saving ? 'Saving...' : invoice ? 'Update' : 'Create Invoice'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── INVOICE PREVIEW MODAL ────────────────────────────────────────────────────
function InvoicePreviewModal({ invoice, clients, onClose }) {
  const client = clients.find((c) => c.id === invoice.client_id) || {};
  const sc = { paid: '#10b981', pending: '#f59e0b', overdue: '#ef4444', draft: '#6b6b80', sent: '#00d4ff' };
  const statusColor = sc[invoice.status] || '#6b6b80';
  const date = new Date(invoice.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const waPhone = client.phone?.replace(/\D/g, '') || '';
  const waText = encodeURIComponent(`Hi ${client.name || 'there'}, your invoice ${invoice.invoice_number} for ₹${(invoice.total_amount || 0).toLocaleString('en-IN')} is ready. Amount due: ₹${(invoice.due_amount || 0).toLocaleString('en-IN')}.`);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,8,0.9)', backdropFilter: 'blur(12px)' }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-xl max-h-[90vh] flex flex-col glass rounded-2xl border border-white/10 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between shrink-0">
          <div className="font-bold">Invoice Preview</div>
          <div className="flex items-center gap-2">
            {waPhone && (
              <a href={`https://wa.me/${waPhone}?text=${waText}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-500/25 text-green-400 text-xs font-medium hover:bg-green-500/25 transition-colors">
                💬 WhatsApp
              </a>
            )}
            <button onClick={() => exportInvoicePDF(invoice, client)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6c63ff]/15 border border-[#6c63ff]/25 text-[#6c63ff] text-xs font-medium hover:bg-[#6c63ff]/25 transition-colors cursor-pointer">
              ⬇ Export PDF
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 cursor-pointer text-sm">✕</button>
          </div>
        </div>
        {/* Preview card */}
        <div className="overflow-y-auto p-5">
          <div className="bg-[#0a0a12] rounded-2xl border border-white/10 overflow-hidden text-sm">
            {/* Status bar */}
            <div className="h-1" style={{ background: statusColor }} />
            {/* Header */}
            <div className="p-6 border-b border-white/8" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,212,255,0.06))' }}>
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <div className="text-2xl font-black gradient-text mb-1">RP.</div>
                  <div className="text-xs text-white/40">Rajat Poddar — Developer & Entrepreneur</div>
                  <div className="text-xs text-white/30 mt-1">📧 solutionspoddar@gmail.com · 📱 +91 7250580175</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/30 uppercase tracking-wider">Invoice</div>
                  <div className="text-xl font-bold text-white mt-1">{invoice.invoice_number}</div>
                  <div className="text-xs text-white/40 mt-1">Date: {date}</div>
                  {invoice.due_date && <div className="text-xs text-white/40">Due: {new Date(invoice.due_date).toLocaleDateString('en-IN')}</div>}
                </div>
              </div>
            </div>
            {/* Client + Project */}
            <div className="p-6 border-b border-white/8 grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Billed To</div>
                <div className="font-bold text-white">{client.name || '—'}</div>
                <div className="text-white/50 text-xs">{client.business || ''}</div>
                {client.email && <div className="text-white/40 text-xs mt-0.5">{client.email}</div>}
              </div>
              <div>
                <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Project</div>
                <div className="font-medium text-white">{invoice.project_name || '—'}</div>
                <span className="inline-block mt-1 text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                  style={{ background: `${statusColor}18`, color: statusColor }}>{invoice.status}</span>
              </div>
            </div>
            {/* Amount breakdown */}
            <div className="p-6 border-b border-white/8">
              <div className="text-xs text-white/30 uppercase tracking-wider mb-4">Amount Breakdown</div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-white/50 text-xs">
                  <span>Project Amount</span><span>₹{(invoice.total_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                {(invoice.discount_amount || 0) > 0 && (
                  <div className="flex justify-between text-red-400/70 text-xs">
                    <span>Discount {invoice.discount_type === 'percent' ? `(${invoice.discount_value}%)` : ''}</span>
                    <span>-₹{(invoice.discount_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/50 text-xs">
                  <span>Amount Paid</span><span>₹{(invoice.paid_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-white/8 mt-1 pt-3 flex justify-between items-center">
                  <span className="font-bold text-white">Amount Due</span>
                  <span className="text-xl font-black" style={{ color: (invoice.due_amount || 0) > 0 ? '#f59e0b' : '#10b981' }}>
                    ₹{(invoice.due_amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
            {invoice.notes && (
              <div className="p-6 border-b border-white/8">
                <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Notes</div>
                <p className="text-white/50 text-xs leading-relaxed">{invoice.notes}</p>
              </div>
            )}
            <div className="p-4 text-center">
              <p className="text-xs text-white/25">Thank you for your business. Please make payment by the due date.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [preview, setPreview] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    const [{ data: inv }, { data: cli }] = await Promise.all([invoicesDb.getAll(), clientsDb.getAll()]);
    setInvoices(inv || []);
    setClients(cli || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (searchParams.get('new')) { setModal('new'); setSearchParams({}); }
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this invoice?')) return;
    await invoicesDb.delete(id);
    load();
  };

  const handleMarkPaid = async (inv) => {
    await invoicesDb.update(inv.id, { status: 'paid', paid_amount: inv.total_amount, due_amount: 0 });
    toast('Invoice marked as paid ✓', 'success');
    load();
  };

  const filtered = invoices.filter((inv) => {
    const clientName = clients.find((c) => c.id === inv.client_id)?.name || '';
    const matchSearch = `${clientName} ${inv.invoice_number} ${inv.project_name}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Summary stats
  const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + (i.total_amount || 0), 0);
  const totalPending = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + (i.due_amount || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-white/30 mt-0.5">{invoices.length} total</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#7c73ff] text-sm font-semibold transition-colors cursor-pointer">
          + New Invoice
        </motion.button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Invoices', value: invoices.length, color: '#6c63ff' },
          { label: 'Paid', value: invoices.filter((i) => i.status === 'paid').length, color: '#10b981' },
          { label: 'Revenue Collected', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: '#10b981' },
          { label: 'Pending Amount', value: `₹${totalPending.toLocaleString('en-IN')}`, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-xl p-4 border border-white/5">
            <div className="text-lg font-black" style={{ color }}>{value}</div>
            <div className="text-xs text-white/35 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..."
          className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6c63ff]/50 transition-colors flex-1 min-w-[200px]" />
        <div className="flex gap-2 flex-wrap">
          {['all', ...Object.keys(STATUS_COLORS)].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer capitalize ${statusFilter === s ? 'bg-[#6c63ff]/20 border border-[#6c63ff]/40 text-white' : 'bg-white/[0.03] border border-white/8 text-white/40 hover:text-white/70'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/25 text-sm">
            {search || statusFilter !== 'all' ? 'No invoices match your filters' : 'No invoices yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-white/30 uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">#</th>
                  <th className="text-left px-5 py-3 font-medium">Client</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Project</th>
                  <th className="text-left px-5 py-3 font-medium">Total</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Due</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => {
                  const client = clients.find((c) => c.id === inv.client_id);
                  const statusColor = STATUS_COLORS[inv.status] || '#6b6b80';
                  const isOverdue = inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== 'paid';
                  return (
                    <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-white/40">{inv.invoice_number}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-white/80">{client?.name || '—'}</div>
                        <div className="text-xs text-white/30">{client?.business || ''}</div>
                      </td>
                      <td className="px-5 py-3.5 text-white/50 hidden md:table-cell">{inv.project_name || '—'}</td>
                      <td className="px-5 py-3.5 font-bold text-white/80">₹{(inv.total_amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className={`text-sm font-medium ${(inv.due_amount || 0) > 0 ? 'text-[#f59e0b]' : 'text-[#10b981]'}`}>
                          ₹{(inv.due_amount || 0).toLocaleString('en-IN')}
                        </span>
                        {isOverdue && <div className="text-[10px] text-red-400 mt-0.5">Overdue</div>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                          style={{ background: `${statusColor}18`, color: statusColor }}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          {inv.status !== 'paid' && (
                            <button onClick={() => handleMarkPaid(inv)}
                              className="px-2.5 py-1 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-medium transition-colors cursor-pointer" title="Mark Paid">
                              ✓ Paid
                            </button>
                          )}
                          <button onClick={() => setPreview(inv)}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white text-xs transition-colors cursor-pointer" title="Preview">👁</button>
                          <button onClick={() => setModal(inv)}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white text-xs transition-colors cursor-pointer">✏️</button>
                          <button onClick={() => handleDelete(inv.id)}
                            className="w-7 h-7 rounded-lg bg-red-500/5 hover:bg-red-500/15 flex items-center justify-center text-red-400/50 hover:text-red-400 text-xs transition-colors cursor-pointer">🗑</button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <InvoiceModal
            invoice={modal === 'new' ? null : modal}
            clients={clients}
            existingInvoices={invoices}
            onSave={() => { setModal(null); load(); }}
            onClose={() => setModal(null)}
          />
        )}
        {preview && (
          <InvoicePreviewModal
            invoice={preview}
            clients={clients}
            onClose={() => setPreview(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

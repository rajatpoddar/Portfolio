import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { quotationsDb, clientsDb } from '../../lib/db';
import { MAINTENANCE_PLANS } from '../../data/pricingLogic';
import { PROJECT_TYPES } from '../../data/features';
import { fetchPricing, calculateTotalDynamic } from '../../services/pricingService';
import { exportQuotationPDF } from '../../services/pdfService';
import FeatureSelector from '../../components/tools/FeatureSelector';
import { useToast } from '../../components/ui/Toast';

const STATUS_COLORS = {
  draft: '#6b6b80', sent: '#00d4ff', accepted: '#10b981', rejected: '#ef4444',
};

// ─── QUOTATION PREVIEW ────────────────────────────────────────────────────────
function QuotePreview({ q, clients }) {
  const client = clients.find((c) => c.id === q.client_id) || {};
  const pricing = calculateTotalDynamic(q.project_type, q.features || [], q.maintenance || null, {});
  const date = new Date(q.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const validUntil = new Date((q.created_at ? new Date(q.created_at) : new Date()).getTime() + 15 * 86400000)
    .toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="bg-[#0a0a12] rounded-2xl border border-white/10 overflow-hidden text-sm">
      <div className="p-6 border-b border-white/8" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,255,0.08))' }}>
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="text-2xl font-black gradient-text mb-1">RP.</div>
            <div className="text-xs text-white/40">Rajat Poddar — Developer & Entrepreneur</div>
            <div className="text-xs text-white/30 mt-1">📧 solutionspoddar@gmail.com · 📱 +91 7250580175</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/30 uppercase tracking-wider">Quotation</div>
            <div className="text-xl font-bold text-white mt-1">#{q.quote_number}</div>
            <div className="text-xs text-white/40 mt-1">Date: {date}</div>
            <div className="text-xs text-white/40">Valid until: {validUntil}</div>
          </div>
        </div>
      </div>
      <div className="p-6 border-b border-white/8 grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Prepared For</div>
          <div className="font-bold text-white">{client.name || q.client_name || '—'}</div>
          <div className="text-white/50">{client.business || '—'}</div>
        </div>
        <div>
          <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Project Type</div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6c63ff]/15 border border-[#6c63ff]/30 text-[#6c63ff] font-medium text-xs">
            {q.project_type}
          </div>
        </div>
      </div>
      <div className="p-6 border-b border-white/8">
        <div className="text-xs text-white/30 uppercase tracking-wider mb-4">Included Features</div>
        {(q.features || []).length === 0
          ? <div className="text-white/30 text-xs">No features selected</div>
          : <div className="grid sm:grid-cols-2 gap-2">
              {(q.features || []).map((f) => (
                <div key={f} className="flex items-center gap-2 text-white/60 text-xs">
                  <span className="w-4 h-4 rounded-full bg-[#6c63ff]/20 flex items-center justify-center text-[#6c63ff] text-[10px]">✓</span>
                  {f}
                </div>
              ))}
            </div>
        }
      </div>
      <div className="p-6 border-b border-white/8">
        <div className="text-xs text-white/30 uppercase tracking-wider mb-4">Pricing Summary</div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-white/50 text-xs"><span>Project Development ({q.project_type})</span><span>Included</span></div>
          <div className="flex justify-between text-white/50 text-xs"><span>Selected Features ({(q.features || []).length})</span><span>Included</span></div>
          {q.maintenance && (
            <div className="flex justify-between text-white/50 text-xs">
              <span>Monthly Maintenance — {MAINTENANCE_PLANS[q.maintenance]?.label}</span>
              <span>₹{pricing.maintenance.toLocaleString('en-IN')}/mo</span>
            </div>
          )}
          <div className="border-t border-white/8 mt-2 pt-3 flex justify-between items-center">
            <span className="font-bold text-white">Total Project Investment</span>
            <span className="text-xl font-black gradient-text">₹{pricing.subtotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
      {q.notes && (
        <div className="p-6 border-b border-white/8">
          <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Notes</div>
          <p className="text-white/50 text-xs leading-relaxed">{q.notes}</p>
        </div>
      )}
      <div className="p-6 text-center">
        <p className="text-xs text-white/25">Valid for 15 days. 50% advance required to begin. Balance due on delivery.</p>
      </div>
    </div>
  );
}

// ─── QUOTE FORM MODAL ─────────────────────────────────────────────────────────
function QuoteModal({ quote, clients, onSave, onClose }) {
  const toast = useToast();
  const [form, setForm] = useState(quote || {
    client_id: '', project_type: 'Standard App', features: [],
    maintenance: '', notes: '', status: 'draft',
  });
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [featurePrices, setFeaturePrices] = useState({});
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => { fetchPricing().then(setFeaturePrices); }, []);

  const pricing = calculateTotalDynamic(form.project_type, form.features || [], form.maintenance || null, featurePrices);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      total_amount: pricing.subtotal,
      quote_number: form.quote_number || `QT-${Date.now().toString().slice(-6)}`,
    };
    if (quote?.id) {
      await quotationsDb.update(quote.id, payload);
    } else {
      await quotationsDb.create(payload);
    }
    setSaving(false);
    toast(quote ? 'Quotation updated' : 'Quotation saved', 'success');
    onSave();
  };

  const STEPS = ['Client & Type', 'Features', 'Maintenance & Notes'];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,8,0.88)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass rounded-2xl border border-white/10"
      >
        <div className="sticky top-0 z-10 glass border-b border-white/8 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="font-bold">{quote ? 'Edit Quotation' : 'New Quotation'}</div>
            <div className="text-xs text-white/30">Step {step + 1} of {STEPS.length} — {STEPS[step]}</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 cursor-pointer text-sm">✕</button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-5 flex gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-[#6c63ff]' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="p-6 flex flex-col gap-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Client</label>
                    <select
                      value={form.client_id}
                      onChange={(e) => set('client_id')(e.target.value)}
                      className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6c63ff]/50 transition-colors"
                    >
                      <option value="">— Select client —</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} {c.business ? `(${c.business})` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Project Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PROJECT_TYPES.map((t) => (
                        <button
                          key={t} type="button" onClick={() => set('project_type')(t)}
                          className={`p-3 rounded-xl border text-sm text-left transition-all cursor-pointer ${form.project_type === t ? 'border-[#6c63ff]/60 bg-[#6c63ff]/10 text-white' : 'border-white/8 bg-white/[0.02] text-white/50 hover:border-white/15'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => set('status')(e.target.value)}
                      className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6c63ff]/50 transition-colors"
                    >
                      {Object.keys(STATUS_COLORS).map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">Select Features</h3>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#6c63ff]/15 text-[#6c63ff] border border-[#6c63ff]/25">
                      {(form.features || []).length} selected
                    </span>
                  </div>
                  <FeatureSelector selected={form.features || []} onChange={set('features')} />
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Maintenance Plan</label>
                    <div className="flex flex-col gap-2">
                      <button type="button" onClick={() => set('maintenance')('')}
                        className={`p-3 rounded-xl border text-sm text-left transition-all cursor-pointer ${!form.maintenance ? 'border-white/20 bg-white/5' : 'border-white/8 bg-white/[0.02] hover:border-white/15'}`}>
                        No Maintenance
                      </button>
                      {Object.entries(MAINTENANCE_PLANS).map(([key, plan]) => (
                        <button key={key} type="button" onClick={() => set('maintenance')(key)}
                          className={`p-3 rounded-xl border text-sm text-left transition-all cursor-pointer ${form.maintenance === key ? 'border-[#6c63ff]/50 bg-[#6c63ff]/10' : 'border-white/8 bg-white/[0.02] hover:border-white/15'}`}>
                          <div className="font-medium">{plan.label}</div>
                          <div className="text-xs text-white/40 mt-0.5">₹{plan.price.toLocaleString('en-IN')}/mo</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Notes</label>
                    <textarea
                      value={form.notes} onChange={(e) => set('notes')(e.target.value)}
                      rows={3} placeholder="Special requirements or notes..."
                      className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6c63ff]/50 transition-colors resize-none"
                    />
                  </div>
                  {/* Pricing summary */}
                  <div className="glass rounded-xl p-4 border border-white/8">
                    <div className="text-xs text-white/30 uppercase tracking-wider mb-3">Pricing Summary</div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/60">Total Project Investment</span>
                      <span className="text-xl font-black gradient-text">₹{pricing.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {form.maintenance && (
                      <div className="flex justify-between items-center mt-1 text-xs text-white/40">
                        <span>+ Monthly Maintenance</span>
                        <span>₹{pricing.maintenance.toLocaleString('en-IN')}/mo</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-6 pb-6 flex justify-between gap-3">
          <button onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
            className="px-5 py-2.5 rounded-xl glass border border-white/10 text-sm font-medium cursor-pointer">
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          {step < STEPS.length - 1
            ? <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setStep(s => s + 1)}
                className="px-6 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#7c73ff] text-sm font-semibold cursor-pointer transition-colors">
                Continue →
              </motion.button>
            : <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSave} disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#7c73ff] text-sm font-semibold disabled:opacity-50 cursor-pointer transition-colors">
                {saving ? 'Saving...' : quote ? 'Update' : 'Save Quotation'}
              </motion.button>
          }
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── PREVIEW MODAL ────────────────────────────────────────────────────────────
function PreviewModal({ quote, clients, onClose }) {
  const client = clients.find((c) => c.id === quote.client_id) || {};
  const waText = encodeURIComponent(
    `Hi ${client.name || 'there'}, please find your quotation #${quote.quote_number} attached.\n\nProject: ${quote.project_type}\nTotal: ₹${(quote.total_amount || 0).toLocaleString('en-IN')}\n\nValid for 15 days. Let me know if you have any questions!`
  );
  const waPhone = client.phone?.replace(/\D/g, '') || '';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,8,0.9)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col glass rounded-2xl border border-white/10 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between shrink-0">
          <div className="font-bold">Quotation Preview</div>
          <div className="flex items-center gap-2">
            {waPhone && (
              <a
                href={`https://wa.me/${waPhone}?text=${waText}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-500/25 text-green-400 text-xs font-medium hover:bg-green-500/25 transition-colors"
              >
                💬 WhatsApp
              </a>
            )}
            <button
              onClick={() => exportQuotationPDF(quote, client, MAINTENANCE_PLANS)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6c63ff]/15 border border-[#6c63ff]/25 text-[#6c63ff] text-xs font-medium hover:bg-[#6c63ff]/25 transition-colors cursor-pointer"
            >
              ⬇ Export PDF
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 cursor-pointer text-sm">✕</button>
          </div>
        </div>
        <div className="overflow-y-auto p-5">
          <div>
            <QuotePreview q={quote} clients={clients} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN QUOTES PAGE ─────────────────────────────────────────────────────────
export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);     // null | 'new' | quote object
  const [preview, setPreview] = useState(null); // null | quote object
  const [searchParams, setSearchParams] = useSearchParams();

  const load = async () => {
    setLoading(true);
    const [{ data: q }, { data: c }] = await Promise.all([quotationsDb.getAll(), clientsDb.getAll()]);
    setQuotes(q || []);
    setClients(c || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (searchParams.get('new')) { setModal('new'); setSearchParams({}); }
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this quotation?')) return;
    await quotationsDb.delete(id);
    load();
  };

  const handleDuplicate = async (id) => {
    await quotationsDb.duplicate(id);
    load();
  };

  const filtered = quotes.filter((q) => {
    const clientName = clients.find((c) => c.id === q.client_id)?.name || '';
    const matchSearch = `${clientName} ${q.quote_number} ${q.project_type}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Quotations</h1>
          <p className="text-sm text-white/30 mt-0.5">{quotes.length} total</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#7c73ff] text-sm font-semibold transition-colors cursor-pointer"
        >
          + New Quotation
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by client, project type..."
          className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6c63ff]/50 transition-colors flex-1 min-w-[200px]"
        />
        <div className="flex gap-2">
          {['all', ...Object.keys(STATUS_COLORS)].map((s) => (
            <button
              key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer capitalize ${
                statusFilter === s ? 'bg-[#6c63ff]/20 border border-[#6c63ff]/40 text-white' : 'bg-white/[0.03] border border-white/8 text-white/40 hover:text-white/70'
              }`}
            >
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
            {search || statusFilter !== 'all' ? 'No quotations match your filters' : 'No quotations yet. Create your first one.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-white/30 uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">#</th>
                  <th className="text-left px-5 py-3 font-medium">Client</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Project Type</th>
                  <th className="text-left px-5 py-3 font-medium">Amount</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, i) => {
                  const client = clients.find((c) => c.id === q.client_id);
                  const statusColor = STATUS_COLORS[q.status] || '#6b6b80';
                  return (
                    <motion.tr
                      key={q.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-white/40">{q.quote_number}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-white/80">{client?.name || '—'}</div>
                        <div className="text-xs text-white/30">{client?.business || ''}</div>
                      </td>
                      <td className="px-5 py-3.5 text-white/50 hidden md:table-cell">{q.project_type}</td>
                      <td className="px-5 py-3.5 font-bold text-white/80">
                        ₹{(q.total_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                          style={{ background: `${statusColor}18`, color: statusColor }}>
                          {q.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-white/30 text-xs hidden lg:table-cell">
                        {new Date(q.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={() => setPreview(q)}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white text-xs transition-colors cursor-pointer" title="Preview">
                            👁
                          </button>
                          <button onClick={() => setModal(q)}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white text-xs transition-colors cursor-pointer" title="Edit">
                            ✏️
                          </button>
                          <button onClick={() => handleDuplicate(q.id)}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white text-xs transition-colors cursor-pointer" title="Duplicate">
                            📋
                          </button>
                          <button onClick={() => handleDelete(q.id)}
                            className="w-7 h-7 rounded-lg bg-red-500/5 hover:bg-red-500/15 flex items-center justify-center text-red-400/50 hover:text-red-400 text-xs transition-colors cursor-pointer" title="Delete">
                            🗑
                          </button>
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
          <QuoteModal
            quote={modal === 'new' ? null : modal}
            clients={clients}
            onSave={() => { setModal(null); load(); }}
            onClose={() => setModal(null)}
          />
        )}
        {preview && (
          <PreviewModal
            quote={preview}
            clients={clients}
            onClose={() => setPreview(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

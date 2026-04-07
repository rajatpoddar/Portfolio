import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { clientsDb } from '../../lib/db';
import ResponsiveTable from '../../components/ui/ResponsiveTable';

function ClientModal({ client, onSave, onClose }) {
  const [form, setForm] = useState(client || { name: '', business: '', email: '', phone: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (client?.id) { await clientsDb.update(client.id, form); }
    else { await clientsDb.create(form); }
    setSaving(false);
    onSave();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(10px)' }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-mid)' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div className="font-bold" style={{ color: 'var(--text)' }}>{client ? 'Edit Client' : 'Add Client'}</div>
          <button onClick={onClose} className="btn-icon w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>✕</button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          {[
            { key: 'name', label: 'Full Name', placeholder: 'Ramesh Agarwal', required: true },
            { key: 'business', label: 'Business / Company', placeholder: 'Agarwal Traders' },
            { key: 'email', label: 'Email', placeholder: 'ramesh@example.com', type: 'email' },
            { key: 'phone', label: 'Phone / WhatsApp', placeholder: '+91 98765 43210' },
          ].map(({ key, label, placeholder, required, type = 'text' }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
                {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
              </label>
              <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
                className="rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Any notes..."
              className="rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors resize-none"
              style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-medium cursor-pointer"
            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-mid)' }}>Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSave} disabled={saving || !form.name.trim()}
            className="flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 cursor-pointer transition-colors text-white"
            style={{ background: 'var(--accent)' }}>
            {saving ? 'Saving...' : client ? 'Update' : 'Add Client'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const load = async () => {
    setLoading(true);
    const { data } = await clientsDb.getAll();
    setClients(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (searchParams.get('new')) { setModal('new'); setSearchParams({}); }
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this client?')) return;
    await clientsDb.delete(id);
    load();
  };

  const filtered = clients.filter((c) =>
    `${c.name} ${c.business} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'name',    label: 'Name' },
    { key: 'business',label: 'Business' },
    { key: 'contact', label: 'Contact' },
    { key: 'added',   label: 'Added' },
    { key: '_actions', label: '', actionsCol: true },
  ];

  const renderCell = (c, key) => {
    if (key === 'name') return (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(0,212,255,0.3))', color: 'var(--text)' }}>
          {c.name?.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{c.name}</span>
      </div>
    );
    if (key === 'business') return <span className="text-sm" style={{ color: 'var(--text-mid)' }}>{c.business || '—'}</span>;
    if (key === 'contact') return (
      <div>
        <div className="text-sm" style={{ color: 'var(--text-mid)' }}>{c.email || '—'}</div>
        {c.phone && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.phone}</div>}
      </div>
    );
    if (key === 'added') return (
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {new Date(c.created_at).toLocaleDateString('en-IN')}
      </span>
    );
    return null;
  };

  const renderActions = (c) => (
    <>
      {c.phone && (
        <a href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
          className="btn-icon w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>💬</a>
      )}
      <button onClick={() => setModal(c)}
        className="btn-icon w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors cursor-pointer"
        style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>✏️</button>
      <button onClick={() => handleDelete(c.id)}
        className="btn-icon w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors cursor-pointer"
        style={{ background: 'rgba(239,68,68,0.05)', color: 'rgba(239,68,68,0.6)' }}>🗑</button>
    </>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Clients</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{clients.length} total</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-white"
          style={{ background: 'var(--accent)' }}>
          + Add Client
        </motion.button>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..."
        className="w-full max-w-sm rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />

      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <ResponsiveTable
          columns={columns}
          rows={filtered}
          renderCell={renderCell}
          renderActions={renderActions}
          loading={loading}
          emptyText={search ? 'No clients match your search' : 'No clients yet. Add your first client.'}
        />
      </div>

      <AnimatePresence>
        {modal && (
          <ClientModal
            client={modal === 'new' ? null : modal}
            onSave={() => { setModal(null); load(); }}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { clientsDb } from '../../lib/db';

function ClientModal({ client, onSave, onClose }) {
  const [form, setForm] = useState(
    client || { name: '', business: '', email: '', phone: '', notes: '' }
  );
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (client?.id) {
      await clientsDb.update(client.id, form);
    } else {
      await clientsDb.create(form);
    }
    setSaving(false);
    onSave();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(10px)' }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md glass rounded-2xl border border-white/10 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <div className="font-bold">{client ? 'Edit Client' : 'Add Client'}</div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 cursor-pointer text-sm">✕</button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {[
            { key: 'name', label: 'Full Name', placeholder: 'John Smith', required: true },
            { key: 'business', label: 'Business / Company', placeholder: 'Acme Corp' },
            { key: 'email', label: 'Email', placeholder: 'john@acme.com', type: 'email' },
            { key: 'phone', label: 'Phone / WhatsApp', placeholder: '+91 98765 43210' },
          ].map(({ key, label, placeholder, required, type = 'text' }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider font-medium">
                {label} {required && <span className="text-[#6c63ff]">*</span>}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6c63ff]/50 transition-colors"
              />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Notes</label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              rows={2}
              placeholder="Any notes about this client..."
              className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6c63ff]/50 transition-colors resize-none"
            />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl glass border border-white/10 text-sm font-medium cursor-pointer">Cancel</button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#7c73ff] text-sm font-semibold disabled:opacity-50 cursor-pointer transition-colors"
          >
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
  const [modal, setModal] = useState(null); // null | 'new' | client object
  const [searchParams, setSearchParams] = useSearchParams();

  const load = async () => {
    setLoading(true);
    const { data } = await clientsDb.getAll();
    setClients(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (searchParams.get('new')) {
      setModal('new');
      setSearchParams({});
    }
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this client? This cannot be undone.')) return;
    await clientsDb.delete(id);
    load();
  };

  const filtered = clients.filter((c) =>
    `${c.name} ${c.business} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-sm text-white/30 mt-0.5">{clients.length} total</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#7c73ff] text-sm font-semibold transition-colors cursor-pointer"
        >
          + Add Client
        </motion.button>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search clients..."
        className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6c63ff]/50 transition-colors max-w-sm"
      />

      {/* Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/25 text-sm">
            {search ? 'No clients match your search' : 'No clients yet. Add your first client.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-white/30 uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Name</th>
                  <th className="text-left px-5 py-3 font-medium">Business</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Contact</th>
                  <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Added</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: 'linear-gradient(135deg, #6c63ff40, #00d4ff40)' }}>
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-white/80">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-white/50">{c.business || '—'}</td>
                    <td className="px-5 py-3.5 text-white/40 hidden md:table-cell">
                      <div>{c.email || '—'}</div>
                      {c.phone && <div className="text-xs mt-0.5">{c.phone}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-white/30 text-xs hidden lg:table-cell">
                      {new Date(c.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        {c.phone && (
                          <a
                            href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center text-green-400 text-xs transition-colors"
                            title="WhatsApp"
                          >💬</a>
                        )}
                        <button
                          onClick={() => setModal(c)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white text-xs transition-colors cursor-pointer"
                        >✏️</button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="w-7 h-7 rounded-lg bg-red-500/5 hover:bg-red-500/15 flex items-center justify-center text-red-400/50 hover:text-red-400 text-xs transition-colors cursor-pointer"
                        >🗑</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { leadsDb, clientsDb } from '../../lib/db';

const STATUS_COLORS = { new: '#6c63ff', contacted: '#00d4ff', converted: '#10b981', closed: '#6b6b80' };

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await leadsDb.getAll();
    setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    await leadsDb.update(id, { status });
    load();
  };

  const handleConvert = async (lead) => {
    if (!confirm(`Convert "${lead.name}" to a client?`)) return;
    await clientsDb.create({ name: lead.name, business: lead.company || '', email: lead.email, phone: lead.phone || '', notes: `Converted from lead. Message: ${lead.message}` });
    await leadsDb.update(lead.id, { status: 'converted' });
    load();
  };

  const filtered = leads.filter((l) =>
    `${l.name} ${l.email} ${l.company}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-white/30 mt-0.5">{leads.length} from portfolio</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Auto-captured from contact form
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="glass rounded-xl p-4 border border-white/5">
            <div className="text-lg font-black" style={{ color }}>
              {leads.filter((l) => (l.status || 'new') === status).length}
            </div>
            <div className="text-xs text-white/35 mt-0.5 capitalize">{status}</div>
          </div>
        ))}
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads..."
        className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6c63ff]/50 transition-colors max-w-sm" />

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/25 text-sm">
            {search ? 'No leads match your search' : 'No leads yet. They appear here when someone fills the contact form.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-white/30 uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Name</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Company</th>
                  <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Message</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => {
                  const status = lead.status || 'new';
                  const statusColor = STATUS_COLORS[status] || '#6b6b80';
                  return (
                    <motion.tr key={lead.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-white/80">{lead.name}</div>
                        <div className="text-xs text-white/35">{lead.email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-white/50 hidden md:table-cell">{lead.company || '—'}</td>
                      <td className="px-5 py-3.5 text-white/40 text-xs hidden lg:table-cell max-w-xs">
                        <div className="truncate">{lead.message || '—'}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <select value={status} onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className="text-xs px-2.5 py-1 rounded-full font-medium capitalize cursor-pointer border-0 outline-none"
                          style={{ background: `${statusColor}18`, color: statusColor }}>
                          {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-white/30 text-xs hidden sm:table-cell">
                        {new Date(lead.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          {lead.email && (
                            <a href={`mailto:${lead.email}`}
                              className="w-7 h-7 rounded-lg bg-[#6c63ff]/10 hover:bg-[#6c63ff]/20 flex items-center justify-center text-[#6c63ff] text-xs transition-colors" title="Email">📧</a>
                          )}
                          {lead.phone && (
                            <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                              className="w-7 h-7 rounded-lg bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center text-green-400 text-xs transition-colors" title="WhatsApp">💬</a>
                          )}
                          {status !== 'converted' && (
                            <button onClick={() => handleConvert(lead)}
                              className="px-2.5 py-1 rounded-lg bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] text-xs font-medium transition-colors cursor-pointer" title="Convert to Client">
                              → Client
                            </button>
                          )}
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
    </div>
  );
}

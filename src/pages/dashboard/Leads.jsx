import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { leadsDb, clientsDb } from '../../lib/db';
import ResponsiveTable from '../../components/ui/ResponsiveTable';

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
    await clientsDb.create({
      name: lead.name, business: lead.company || '', email: lead.email,
      phone: lead.phone || '', notes: `Converted from lead. Message: ${lead.message}`,
    });
    await leadsDb.update(lead.id, { status: 'converted' });
    load();
  };

  const filtered = leads.filter((l) =>
    `${l.name} ${l.email} ${l.company}`.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'name',     label: 'Name' },
    { key: 'company',  label: 'Company' },
    { key: 'status',   label: 'Status' },
    { key: 'date',     label: 'Date' },
    { key: '_actions', label: '', actionsCol: true },
  ];

  const renderCell = (lead, key) => {
    const status = lead.status || 'new';
    const statusColor = STATUS_COLORS[status] || '#6b6b80';
    if (key === 'name') return (
      <div>
        <div className="font-medium text-sm text-white/80">{lead.name}</div>
        <div className="text-xs text-white/35 mt-0.5">{lead.email}</div>
      </div>
    );
    if (key === 'company') return <span className="text-sm text-white/50">{lead.company || '—'}</span>;
    if (key === 'status') return (
      <select value={status} onChange={(e) => handleStatusChange(lead.id, e.target.value)}
        className="text-xs px-2.5 py-1 rounded-full font-medium capitalize cursor-pointer border-0 outline-none"
        style={{ background: `${statusColor}18`, color: statusColor, minHeight: 'unset' }}>
        {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    );
    if (key === 'date') return (
      <span className="text-xs text-white/35">
        {new Date(lead.created_at).toLocaleDateString('en-IN')}
      </span>
    );
    return null;
  };

  const renderActions = (lead) => {
    const status = lead.status || 'new';
    return (
      <>
        {lead.email && (
          <a href={`mailto:${lead.email}`}
            className="btn-icon w-8 h-8 rounded-lg bg-[#6c63ff]/10 hover:bg-[#6c63ff]/20 flex items-center justify-center text-[#6c63ff] text-xs transition-colors">
            📧
          </a>
        )}
        {lead.phone && (
          <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
            className="btn-icon w-8 h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center text-green-400 text-xs transition-colors">
            💬
          </a>
        )}
        {status !== 'converted' && (
          <button onClick={() => handleConvert(lead)}
            className="btn-icon px-2.5 py-1 rounded-lg bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] text-xs font-medium transition-colors cursor-pointer">
            → Client
          </button>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-white/30 mt-0.5">{leads.length} from portfolio</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Auto-captured
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
        className="w-full max-w-sm bg-white/[0.04] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6c63ff]/50 transition-colors" />

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <ResponsiveTable
          columns={columns}
          rows={filtered}
          renderCell={renderCell}
          renderActions={renderActions}
          loading={loading}
          emptyText={search ? 'No leads match your search' : 'No leads yet. They appear when someone fills the contact form.'}
        />
      </div>
    </div>
  );
}

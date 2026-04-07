/**
 * ResponsiveTable
 * On mobile (< md): renders each row as a stacked card
 * On desktop (>= md): renders a normal table
 *
 * columns: [{ key, label, className?, mobileHide? }]
 * rows: array of objects
 * renderCell: (row, colKey) => ReactNode
 * renderActions: (row) => ReactNode
 * keyField: string (unique key per row)
 */
import { motion } from 'framer-motion';

export default function ResponsiveTable({ columns, rows, renderCell, renderActions, keyField = 'id', loading, emptyText = 'No data yet.' }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-5 h-5 border-2 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-14 text-sm" style={{ color: 'var(--text-muted)' }}>
        {emptyText}
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile: card list ── */}
      <div className="md:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
        {rows.map((row, i) => (
          <motion.div key={row[keyField]} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
            {/* Primary info — always visible */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                {renderCell(row, columns[0].key)}
              </div>
              {renderActions && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {renderActions(row)}
                </div>
              )}
            </div>
            {/* Secondary fields */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1">
              {columns.slice(1).filter(c => !c.actionsCol).map(col => (
                <div key={col.key} className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold"
                    style={{ color: 'var(--text-muted)' }}>
                    {col.label}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-mid)' }}>
                    {renderCell(row, col.key)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Desktop: table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs uppercase tracking-wider"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              {columns.map(col => (
                <th key={col.key}
                  className={`text-left px-5 py-3 font-medium ${col.className || ''}`}>
                  {col.actionsCol ? '' : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr key={row[keyField]} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b last:border-0 transition-colors hover:bg-white/[0.02]"
                style={{ borderColor: 'var(--border)' }}>
                {columns.map(col => (
                  <td key={col.key}
                    className={`px-5 py-3.5 ${col.className || ''}`}>
                    {col.actionsCol
                      ? <div className="flex items-center gap-1.5 justify-end">{renderActions?.(row)}</div>
                      : renderCell(row, col.key)
                    }
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

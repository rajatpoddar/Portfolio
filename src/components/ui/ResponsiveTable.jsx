import { motion } from 'framer-motion';

/**
 * ResponsiveTable
 * Mobile (< md): each row = stacked card
 * Desktop (>= md): normal table
 */
export default function ResponsiveTable({
  columns, rows, renderCell, renderActions,
  keyField = 'id', loading, emptyText = 'No data yet.',
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-5 h-5 border-2 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-14 text-sm text-white/25">
        {emptyText}
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile: card list ── */}
      <div className="md:hidden divide-y divide-white/5">
        {rows.map((row, i) => (
          <motion.div key={row[keyField]} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
            {/* Primary info + actions in one row */}
            <div className="flex items-start justify-between gap-2 mb-2">
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
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {columns.slice(1).filter(c => !c.actionsCol).map(col => (
                <div key={col.key} className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-white/25">
                    {col.label}
                  </span>
                  <span className="text-xs text-white/55">
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
            <tr className="border-b border-white/5 text-xs text-white/30 uppercase tracking-wider">
              {columns.map(col => (
                <th key={col.key}
                  className={`text-left px-5 py-3 font-medium whitespace-nowrap ${col.className || ''}`}>
                  {col.actionsCol ? '' : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr key={row[keyField]} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                {columns.map(col => (
                  <td key={col.key}
                    className={`px-5 py-3.5 ${col.actionsCol ? 'w-px' : ''} ${col.className || ''}`}>
                    {col.actionsCol
                      ? (
                        <div className="flex items-center gap-1.5 justify-end whitespace-nowrap">
                          {renderActions?.(row)}
                        </div>
                      )
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

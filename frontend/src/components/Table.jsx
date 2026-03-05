import { useState } from 'react'
import './Table.css'

export default function Table({ columns, data, pageSize = 10, loading }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil((data?.length || 0) / pageSize)
  const paginated = data?.slice((page - 1) * pageSize, page * pageSize) || []

  if (loading) return <div className="center-loader"><div className="loading-spinner" /></div>
  if (!data?.length) return (
    <div className="empty-state">
      <div className="empty-icon">📭</div>
      <h3>No data found</h3>
      <p>Nothing to display here yet.</p>
    </div>
  )

  return (
    <div>
      <div className="vd-table-wrapper">
        <table className="vd-table">
          <thead>
            <tr>{columns.map(col => <th key={col.key} style={{ width: col.width }}>{col.label}</th>)}</tr>
          </thead>
          <tbody>
            {paginated.map((row, idx) => (
              <tr key={row.id || idx}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="table-pagination">
          <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, data.length)} of {data.length}</span>
          <div className="pagination-buttons">
            <button className="pagination-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i
              return p <= totalPages ? (
                <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ) : null
            })}
            <button className="pagination-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
          </div>
        </div>
      )}
    </div>
  )
}

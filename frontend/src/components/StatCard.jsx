import './StatCard.css'

export default function StatCard({ label, value, icon, trend, trendLabel, sub, accentColor, iconBg, iconColor }) {
  return (
    <div className="stat-card" style={{ '--card-accent': accentColor, '--icon-bg': iconBg, '--icon-color': iconColor }}>
      <div className="stat-card-header">
        <div className="stat-card-icon">{icon}</div>
        {trend !== undefined && (
          <span className={`stat-card-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <div className="stat-card-value">{value ?? '—'}</div>
        <div className="stat-card-label">{label}</div>
      </div>
      {sub && <div className="stat-card-sub">{sub}</div>}
      {trendLabel && <div className="stat-card-sub">{trendLabel}</div>}
    </div>
  )
}

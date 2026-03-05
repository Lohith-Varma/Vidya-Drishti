import './SectionCard.css'

export default function SectionCard({ title, icon, actions, children, noPadding = false }) {
  return (
    <div className="section-card">
      {(title || actions) && (
        <div className="section-card-header">
          {title && <div className="section-card-title">{icon}{title}</div>}
          {actions && <div className="section-card-actions">{actions}</div>}
        </div>
      )}
      <div className={`section-card-body${noPadding ? ' no-padding' : ''}`}>{children}</div>
    </div>
  )
}

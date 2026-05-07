import { useState } from 'react'
import type { ValidationResult } from '../types/gtfs'

interface Props {
  result: ValidationResult
}

const SEVERITY_LABELS: Record<string, string> = {
  ok: 'OK',
  warning: 'Warning',
  critical: 'Critical',
  info: 'Info',
}

export function ValidationCard({ result }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`val-card val-card--${result.severity}`}>
      <div className="val-card-header" onClick={() => result.affectedCount > 0 && setExpanded(e => !e)}>
        <div className="val-card-left">
          <span className={`severity-badge severity-badge--${result.severity}`}>
            {SEVERITY_LABELS[result.severity]}
          </span>
          <div>
            <div className="val-card-name">{result.name}</div>
            <div className="val-card-desc">{result.description}</div>
          </div>
        </div>
        <div className="val-card-right">
          {result.affectedCount > 0 && (
            <>
              <span className="val-card-count">{result.affectedCount.toLocaleString()}</span>
              <span className="val-card-toggle">{expanded ? '▲' : '▼'}</span>
            </>
          )}
          {result.affectedCount === 0 && <span className="val-card-ok-icon">✓</span>}
        </div>
      </div>

      {expanded && result.affectedItems.length > 0 && (
        <div className="val-card-body">
          {result.details && <p className="val-card-details">{result.details}</p>}
          <ul className="val-card-list">
            {result.affectedItems.map((item, i) => (
              <li key={i}><code>{item}</code></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

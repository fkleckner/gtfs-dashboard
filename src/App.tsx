import { useFeed } from './hooks/useFeed'
import { FeedDropzone } from './components/FeedDropzone'
import { FeedSummary } from './components/FeedSummary'
import { ValidationCard } from './components/ValidationCard'
import './styles.css'

export default function App() {
  const { status, feed, results, error, feedName, loadingStep, loadFile, reset } = useFeed()

  const criticalCount = results.filter(r => r.severity === 'critical').length
  const warningCount = results.filter(r => r.severity === 'warning').length
  const okCount = results.filter(r => r.severity === 'ok').length

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="10" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              <circle cx="12" cy="16" r="1"/>
            </svg>
            GTFS Monitor
          </div>
          {status === 'done' && (
            <button className="btn-reset" onClick={reset}>Load another feed</button>
          )}
        </div>
      </header>

      <main className="app-main">
        {status === 'idle' && (
          <div className="center-panel">
            <h1 className="hero-title">GTFS Feed Health Dashboard</h1>
            <p className="hero-sub">
              Load a GTFS <code>.zip</code> file to validate its structure and surface data quality issues.
            </p>
            <FeedDropzone onFile={loadFile} />
          </div>
        )}

        {status === 'loading' && (
          <div className="center-panel">
            <div className="loading-state">
              <div className="spinner" />
              <p>{loadingStep}</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="center-panel">
            <div className="error-state">
              <p>Failed to parse feed: {error}</p>
              <button className="btn-reset" onClick={reset}>Try again</button>
            </div>
          </div>
        )}

        {status === 'done' && feed && (
          <div className="dashboard">
            <FeedSummary feed={feed} feedName={feedName} />

            <div className="summary-badges">
              {criticalCount > 0 && (
                <span className="summary-badge summary-badge--critical">{criticalCount} critical</span>
              )}
              {warningCount > 0 && (
                <span className="summary-badge summary-badge--warning">{warningCount} warning</span>
              )}
              {okCount > 0 && (
                <span className="summary-badge summary-badge--ok">{okCount} passing</span>
              )}
            </div>

            <div className="validation-list">
              {results
                .sort((a, b) => {
                  const order = { critical: 0, warning: 1, info: 2, ok: 3 }
                  return order[a.severity] - order[b.severity]
                })
                .map((r) => (
                  <ValidationCard key={r.id} result={r} />
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

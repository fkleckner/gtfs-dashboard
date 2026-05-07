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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6v6"/>
              <path d="M15 6v6"/>
              <path d="M2 12h19.6"/>
              <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/>
              <circle cx="7" cy="18" r="2"/>
              <path d="M9 18h5"/>
              <circle cx="16" cy="18" r="2"/>
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

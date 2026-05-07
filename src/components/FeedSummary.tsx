import type { GTFSFeed } from '../types/gtfs'

interface Props {
  feed: GTFSFeed
  feedName: string
}

export function FeedSummary({ feed, feedName }: Props) {
  const agencyName = feed.agency[0]?.agency_name ?? 'Unknown agency'

  const stats = [
    { label: 'Routes', value: feed.routes.length },
    { label: 'Trips', value: feed.trips.length },
    { label: 'Stops', value: feed.stops.length },
    { label: 'Stop times', value: feed.stopTimes.length },
    { label: 'Shapes', value: feed.shapes.length },
    { label: 'Service periods', value: feed.calendar.length },
  ]

  return (
    <div className="feed-summary">
      <div className="feed-summary-header">
        <div>
          <div className="feed-summary-agency">{agencyName}</div>
          <div className="feed-summary-file">{feedName}</div>
        </div>
      </div>
      <div className="feed-summary-stats">
        {stats.map((s) => (
          <div key={s.label} className="stat-chip">
            <span className="stat-value">{s.value.toLocaleString()}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

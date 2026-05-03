import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import SetlistView from '../components/SetlistView.jsx'
import { annotateSongDebutDates, getDebutsForShow, formatDate } from '../utils/stats.js'

export default function ConcertPage({ data }) {
  const { id } = useParams()
  const { loading, error, setlists } = data

  const show = useMemo(() => setlists.find(s => s.id === id), [setlists, id])

  const debutMap = useMemo(() => {
    if (!setlists.length) return {}
    return annotateSongDebutDates(setlists)
  }, [setlists])

  const debutNames = useMemo(() => {
    if (!show) return []
    return getDebutsForShow(show, debutMap)
  }, [show, debutMap])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>
  if (!show) return <div className="page-container"><div className="empty">Concert not found.</div></div>

  const liveSongs = show.songs.filter(s => !s.tape)

  return (
    <div className="page-container">
      <div className="breadcrumb">
        {show.tour ? (
          <>
            <Link to="/tours">Tours</Link>
            <span className="breadcrumb__sep">›</span>
            <Link to={`/tour/${encodeURIComponent(show.tour)}`}>{show.tour}</Link>
            <span className="breadcrumb__sep">›</span>
          </>
        ) : (
          <>
            <Link to="/">Overview</Link>
            <span className="breadcrumb__sep">›</span>
          </>
        )}
        <span>{formatDate(show.date)}</span>
      </div>

      <div className="page-heading">
        <h1>{show.venue}</h1>
        <p className="sub">
          {show.city}{show.state ? `, ${show.state}` : ''}, {show.country} · {formatDate(show.date)}
        </p>
        {show.tour && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            <Link to={`/tour/${encodeURIComponent(show.tour)}`}>{show.tour}</Link>
          </p>
        )}
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-card__value">{liveSongs.length}</div>
          <div className="stat-card__label">Songs played</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{debutNames.length}</div>
          <div className="stat-card__label">Debuts</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{show.songs.filter(s => s.encore > 0 && !s.tape).length}</div>
          <div className="stat-card__label">Encore songs</div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Setlist</div>
        <div className="card">
          <SetlistView songs={show.songs} debutNames={debutNames} />
        </div>
      </div>

      {show.setlistFmUrl && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '1rem' }}>
          <a href={show.setlistFmUrl} target="_blank" rel="noopener noreferrer">View on setlist.fm ↗</a>
        </p>
      )}
    </div>
  )
}

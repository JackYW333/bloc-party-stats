import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { computeVenueStats } from '../utils/stats.js'

export default function AllVenuesPage({ data }) {
  const { loading, error, setlists } = data
  const [search, setSearch] = useState('')
  const venues = useMemo(() => computeVenueStats(setlists), [setlists])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? venues.filter(v =>
      v.venue.toLowerCase().includes(q) || v.city.toLowerCase().includes(q)
    ) : venues
  }, [venues, search])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>

  const max = venues[0]?.count || 1

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/">Overview</Link>
        <span className="breadcrumb__sep">›</span>
        <span>All Venues</span>
      </div>
      <div className="page-heading">
        <h1>All Venues</h1>
        <p className="sub">{venues.length} venues visited</p>
      </div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search venues or cities…"
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '7px', padding: '0.5rem 0.75rem',
          color: 'var(--text)', fontSize: '0.875rem', width: '100%', maxWidth: 300,
          outline: 'none', marginBottom: '1rem',
        }}
      />
      <div className="card">
        <ol className="ranked-list">
          {filtered.map((v, i) => (
            <li key={`${v.venue}-${v.city}`}>
              <span className="ranked-list__rank">{i + 1}</span>
              <Link to={`/venue/${encodeURIComponent(v.venue)}/${encodeURIComponent(v.city)}/${v.countryCode}`} className="ranked-list__name" style={{ color: 'var(--text)' }}>{v.venue}</Link>
              <span className="ranked-list__meta" style={{ fontSize: '0.75rem' }}>{v.city}</span>
              <div className="ranked-list__bar-wrap">
                <div className="ranked-list__bar" style={{ width: `${Math.round((v.count / max) * 100)}%` }} />
              </div>
              <span className="ranked-list__meta">{v.count}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

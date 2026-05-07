import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { computeCityStats } from '../utils/stats.js'

export default function AllCitiesPage({ data }) {
  const { loading, error, setlists } = data
  const [search, setSearch] = useState('')
  const cities = useMemo(() => computeCityStats(setlists), [setlists])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? cities.filter(c =>
      c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    ) : cities
  }, [cities, search])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>

  const max = cities[0]?.count || 1

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/">Overview</Link>
        <span className="breadcrumb__sep">›</span>
        <span>All Cities</span>
      </div>
      <div className="page-heading">
        <h1>All Cities</h1>
        <p className="sub">{cities.length} cities visited</p>
      </div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search cities or countries…"
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '7px', padding: '0.5rem 0.75rem',
          color: 'var(--text)', fontSize: '0.875rem', width: '100%', maxWidth: 300,
          outline: 'none', marginBottom: '1rem',
        }}
      />
      <div className="card">
        <ol className="ranked-list">
          {filtered.map((c, i) => (
            <li key={`${c.city}-${c.country}`}>
              <span className="ranked-list__rank">{i + 1}</span>
              <Link to={`/city/${encodeURIComponent(c.city)}/${c.countryCode}`} className="ranked-list__name" style={{ color: 'var(--text)' }}>{c.city}</Link>
              <span className="ranked-list__meta" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{c.country}</span>
              <div className="ranked-list__bar-wrap">
                <div className="ranked-list__bar" style={{ width: `${Math.round((c.count / max) * 100)}%` }} />
              </div>
              <span className="ranked-list__meta">{c.count}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

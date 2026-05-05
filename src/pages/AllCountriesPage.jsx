import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { computeCountryStats } from '../utils/stats.js'
import WorldMap from '../components/WorldMap.jsx'

export default function AllCountriesPage({ data }) {
  const { loading, error, setlists } = data
  const countries = useMemo(() => computeCountryStats(setlists), [setlists])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>

  const max = countries[0]?.count || 1

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/">Overview</Link>
        <span className="breadcrumb__sep">›</span>
        <span>All Countries</span>
      </div>
      <div className="page-heading">
        <h1>All Countries</h1>
        <p className="sub">{countries.length} countries visited</p>
      </div>
      <div className="section">
        <WorldMap countries={countries} />
      </div>
      <div className="card">
        <ol className="ranked-list">
          {countries.map((c, i) => (
            <li key={c.code}>
              <span className="ranked-list__rank">{i + 1}</span>
              <Link to={`/country/${c.code}`} className="ranked-list__name" style={{ color: 'var(--text)' }}>{c.name}</Link>
              <span className="country-code">{c.code}</span>
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

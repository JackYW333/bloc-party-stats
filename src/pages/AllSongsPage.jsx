import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AlbumBadge from '../components/AlbumBadge.jsx'
import { computeSongStats } from '../utils/stats.js'

export default function AllSongsPage({ data }) {
  const { loading, error, setlists } = data
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('plays')

  const songs = useMemo(() => computeSongStats(setlists), [setlists])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = q ? songs.filter(s => s.name.toLowerCase().includes(q)) : songs
    if (sortBy === 'plays') return list
    if (sortBy === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'album') return [...list].sort((a, b) => {
      const ay = a.album?.year ?? 9999
      const by = b.album?.year ?? 9999
      return ay !== by ? ay - by : a.name.localeCompare(b.name)
    })
    return list
  }, [songs, search, sortBy])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>

  const max = songs[0]?.count || 1

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/">Overview</Link>
        <span className="breadcrumb__sep">›</span>
        <span>All Songs</span>
      </div>

      <div className="page-heading">
        <h1>All Songs</h1>
        <p className="sub">{songs.length} unique songs played live</p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search songs…"
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '7px', padding: '0.5rem 0.75rem',
            color: 'var(--text)', fontSize: '0.875rem', width: '100%', maxWidth: 300,
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[['plays', 'Most Played'], ['name', 'A–Z'], ['album', 'By Release']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setSortBy(val)}
              style={{
                background: sortBy === val ? 'var(--accent)' : 'var(--bg-card)',
                color: sortBy === val ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border)', borderRadius: '5px',
                padding: '0.3rem 0.65rem', cursor: 'pointer', fontSize: '0.8rem',
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <ol className="ranked-list">
          {filtered.map((s, i) => (
            <li key={s.name}>
              <span className="ranked-list__rank">{i + 1}</span>
              <Link to={`/song/${encodeURIComponent(s.name)}`} className="ranked-list__name" style={{ color: 'var(--text)' }}>{s.name}</Link>
              <AlbumBadge album={s.album} />
              <div className="ranked-list__bar-wrap">
                <div className="ranked-list__bar" style={{ width: `${Math.round((s.count / max) * 100)}%` }} />
              </div>
              <span className="ranked-list__meta">{s.count}×</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

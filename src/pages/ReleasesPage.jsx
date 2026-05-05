import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { computeAlbumCoverage } from '../utils/stats.js'
import albumData from '../../config/albums.json'
import AlbumDonut from '../components/AlbumDonut.jsx'

const TYPE_ORDER = ['album', 'ep', 'single', 'compilation', 'unreleased']
const TYPE_LABELS = {
  album: 'Albums',
  ep: 'EPs',
  single: 'Singles',
  compilation: 'Compilations',
  unreleased: 'Unreleased',
}

function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b
}

export default function ReleasesPage({ data }) {
  const { loading, error, setlists } = data

  const { coverageMap, coverage } = useMemo(() => {
    if (!setlists.length) return { coverageMap: {}, coverage: [] }
    const cov = computeAlbumCoverage(setlists)
    return { coverageMap: Object.fromEntries(cov.map(c => [c.id, c])), coverage: cov }
  }, [setlists])

  const grouped = useMemo(() => {
    const byType = {}
    TYPE_ORDER.forEach(t => { byType[t] = [] })
    albumData.forEach(album => {
      const type = album.type || 'single'
      if (!byType[type]) byType[type] = []
      byType[type].push(album)
    })
    TYPE_ORDER.forEach(t => {
      byType[t].sort((a, b) => {
        if (a.year == null && b.year == null) return a.name.localeCompare(b.name)
        if (a.year == null) return 1
        if (b.year == null) return -1
        return a.year - b.year
      })
    })
    return byType
  }, [])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/">Overview</Link>
        <span className="breadcrumb__sep">›</span>
        <span>Releases</span>
      </div>
      <div className="page-heading">
        <h1>Releases</h1>
        <p className="sub">{albumData.length} releases</p>
      </div>

      {TYPE_ORDER.map(type => {
        const releases = grouped[type]
        if (!releases?.length) return null
        return (
          <div key={type} className="section">
            <div className="section-title">{TYPE_LABELS[type]}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
              {releases.map(album => {
                const cov = coverageMap[album.id]
                const textColor = luminance(album.color) > 0.45 ? '#111' : '#fff'
                return (
                  <Link
                    key={album.id}
                    to={`/album/${album.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = album.color}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      {/* Art or colour swatch */}
                      <div style={{ position: 'relative', aspectRatio: '1', background: album.color + '33' }}>
                        {(album.imageUrl || album.mbid) && (
                          <img
                            src={album.imageUrl || `https://coverartarchive.org/release-group/${album.mbid}/front`}
                            alt={album.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={e => { e.target.style.display = 'none' }}
                          />
                        )}
                        {/* Colour strip at bottom */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: album.color }} />
                      </div>

                      <div style={{ padding: '0.625rem 0.75rem' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, marginBottom: '0.2rem' }}>
                          {album.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {album.year ?? 'TBA'}
                        </div>
                        {cov && cov.plays > 0 && (
                          <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            {cov.plays} plays · {cov.pct}%
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}

      {coverage.length > 0 && (
        <div className="section">
          <AlbumDonut data={coverage} showLink={false} />
        </div>
      )}
    </div>
  )
}

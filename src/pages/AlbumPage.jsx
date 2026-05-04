import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import StatCard from '../components/StatCard.jsx'
import { computeSongStats, formatDate } from '../utils/stats.js'
import albumData from '../../config/albums.json'

export default function AlbumPage({ data }) {
  const { albumId } = useParams()
  const { loading, error, setlists } = data

  const album = albumData.find(a => a.id === albumId)

  const albumSongsLower = useMemo(
    () => new Set((album?.songs || []).map(s => s.toLowerCase())),
    [album]
  )

  const albumShows = useMemo(
    () => setlists.filter(s => s.songs.some(song => !song.tape && albumSongsLower.has(song.name.toLowerCase()))),
    [setlists, albumSongsLower]
  )

  const songStats = useMemo(() => {
    if (!setlists.length || !album) return []
    return computeSongStats(setlists).filter(s => albumSongsLower.has(s.name.toLowerCase()))
  }, [setlists, album, albumSongsLower])

  const totalPlays = useMemo(() => songStats.reduce((sum, s) => sum + s.count, 0), [songStats])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>
  if (!album) return <div className="page-container"><div className="empty">Album not found.</div></div>

  const pctShows = setlists.length ? Math.round((albumShows.length / setlists.length) * 100) : 0
  const max = songStats[0]?.count || 1

  return (
    <div className="page-container">
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {(album.imageUrl || album.mbid) && (
          <img
            src={album.imageUrl || `https://coverartarchive.org/release-group/${album.mbid}/front`}
            alt={`${album.name} cover art`}
            style={{
              width: 140, height: 140, objectFit: 'cover',
              borderRadius: '8px', flexShrink: 0,
              border: `2px solid ${album.color}44`,
            }}
            onError={e => { e.target.style.display = 'none' }}
          />
        )}
        <div>
          <div className="breadcrumb" style={{ marginBottom: '0.5rem' }}>
            <Link to="/">Overview</Link>
            <span className="breadcrumb__sep">›</span>
            <span>{album.name}</span>
          </div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem', fontWeight: 700 }}>
            <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: album.color, flexShrink: 0 }} />
            {album.name}
          </h1>
          {album.year && <p className="sub" style={{ marginTop: '0.25rem' }}>{album.year}</p>}
        </div>
      </div>

      <div className="stat-grid">
        <StatCard value={totalPlays.toLocaleString()} label="Total Plays" />
        <StatCard value={songStats.length} label={`Songs Played`} />
        <StatCard value={`${pctShows}%`} label="Of Shows Featured" />
        <StatCard value={songStats[0]?.name ?? '—'} label="Most Played Song" />
      </div>

      <div className="section">
        <div className="card">
          <div className="card-title">Songs</div>
          <ol className="ranked-list">
            {album.songs.map((songName, i) => {
              const stat = songStats.find(s => s.name.toLowerCase() === songName.toLowerCase())
              return (
                <li key={songName}>
                  <span className="ranked-list__rank">{i + 1}</span>
                  {stat
                    ? <Link to={`/song/${encodeURIComponent(stat.name)}`} className="ranked-list__name" style={{ color: 'var(--text)' }}>{stat.name}</Link>
                    : <span className="ranked-list__name" style={{ color: 'var(--text-dim)' }}>{songName}</span>
                  }
                  {stat ? (
                    <>
                      <div className="ranked-list__bar-wrap">
                        <div className="ranked-list__bar" style={{ width: `${Math.round((stat.count / max) * 100)}%`, background: album.color }} />
                      </div>
                      <span className="ranked-list__meta">{stat.count}×</span>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>never played</span>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}

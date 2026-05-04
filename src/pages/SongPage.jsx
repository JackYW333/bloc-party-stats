import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import StatCard from '../components/StatCard.jsx'
import AlbumBadge from '../components/AlbumBadge.jsx'
import { getAlbum, formatDate, annotateSongDebutDates, computeSongGaps, countShowsWithSetlist } from '../utils/stats.js'
import songNotes from '../../config/song-notes.json'

function getPosition(show, songName) {
  const liveSongs = show.songs.filter(s => !s.tape)
  const idx = liveSongs.findIndex(s => s.name === songName)
  if (idx === -1) return null
  if (idx === 0) return 'Opener'
  if (idx === liveSongs.length - 1) return 'Closer'
  const song = liveSongs[idx]
  if (song.encore > 0) return song.encore > 1 ? `Encore ${song.encore}` : 'Encore'
  return null
}

export default function SongPage({ data }) {
  const { songName } = useParams()
  const decoded = decodeURIComponent(songName)
  const { loading, error, setlists } = data

  const album = getAlbum(decoded)

  const shows = useMemo(
    () => setlists
      .filter(s => s.songs.some(song => !song.tape && song.name === decoded))
      .sort((a, b) => a.date.localeCompare(b.date)),
    [setlists, decoded]
  )

  const debutMap = useMemo(() => annotateSongDebutDates(setlists), [setlists])
  const gaps = useMemo(() => computeSongGaps(setlists, decoded), [setlists, decoded])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>
  if (!shows.length) return <div className="page-container"><div className="empty">No performances found for "{decoded}".</div></div>

  const first = shows[0]
  const last = shows[shows.length - 1]
  const showsWithSetlist = countShowsWithSetlist(setlists)
  const pct = showsWithSetlist ? Math.round((shows.length / showsWithSetlist) * 100) : 0
  const note = songNotes[decoded]?.note

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/">Overview</Link>
        <span className="breadcrumb__sep">›</span>
        <span>{decoded}</span>
      </div>

      <div className="page-heading">
        <h1>{decoded}</h1>
        <div style={{ marginTop: '0.5rem' }}><AlbumBadge album={album} /></div>
      </div>

      {note && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderLeft: '3px solid var(--accent)', borderRadius: '6px',
          padding: '0.75rem 1rem', marginBottom: '1.5rem',
          fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6,
        }}>
          {note}
        </div>
      )}

      <div className="stat-grid">
        <StatCard value={shows.length} label="Times Played" />
        <StatCard value={`${pct}%`} label="Of All Shows" />
        <StatCard value={formatDate(first.date)} label="First Played" />
        <StatCard value={formatDate(last.date)} label="Last Played" />
        {gaps && <StatCard value={`${gaps.showsSinceLast} shows / ${gaps.daysSinceLast} days`} label="Since Last Played" />}
        {gaps?.longestGap > 0 && (
          <StatCard
            value={`${gaps.longestGap} days`}
            label={`Longest Break (${gaps.longestGapFrom?.slice(0,4)}–${gaps.longestGapTo?.slice(0,4)})`}
          />
        )}
      </div>

      <div className="section">
        <div className="section-title">All Performances</div>
        <div className="table-scroll">
          <table className="shows-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Venue</th>
                <th>City</th>
                <th>Country</th>
                <th>Tour</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show, i) => {
                const pos = getPosition(show, decoded)
                const isDebut = debutMap[decoded] === show.date
                const songEntry = show.songs.find(s => !s.tape && s.name === decoded)
                const info = songEntry?.info || null
                return (
                  <tr key={show.id}>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{i + 1}</td>
                    <td style={{ whiteSpace: 'nowrap' }}><Link to={`/concert/${show.id}`}>{formatDate(show.date)}</Link></td>
                    <td><Link to={`/concert/${show.id}`}>{show.venue}</Link></td>
                    <td>
                      <Link to={`/city/${encodeURIComponent(show.city)}/${show.countryCode}`} style={{ color: 'var(--text)' }}>
                        {show.city}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/country/${show.countryCode}`}>
                        <span className="country-code">{show.countryCode}</span>
                      </Link>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {show.tour ? <Link to={`/tour/${encodeURIComponent(show.tour)}`}>{show.tour}</Link> : '—'}
                    </td>
                    <td style={{
                      maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--text-dim)',
                      fontStyle: 'italic',
                    }} title={info || undefined}>
                      {info || '—'}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        {isDebut && <span className="tag tag--debut">debut</span>}
                        {pos && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pos}</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

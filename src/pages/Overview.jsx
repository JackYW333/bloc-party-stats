import { useMemo } from 'react'
import StatCard from '../components/StatCard.jsx'
import SongTable from '../components/SongTable.jsx'
import ShowsPerYear from '../components/ShowsPerYear.jsx'
import AlbumCoverage from '../components/AlbumCoverage.jsx'
import GeoBreakdown from '../components/GeoBreakdown.jsx'
import OpenerCloser from '../components/OpenerCloser.jsx'
import {
  computeSongStats,
  computeShowsPerYear,
  computeCountryStats,
  computeCityStats,
  computeVenueStats,
  computeAlbumCoverage,
  computeOpeners,
  computeClosers,
  countUniqueSongs,
  formatDate,
} from '../utils/stats.js'

export default function Overview({ data }) {
  const { loading, error, setlists, lastUpdated } = data

  const stats = useMemo(() => {
    if (!setlists.length) return null
    return {
      songs: computeSongStats(setlists),
      perYear: computeShowsPerYear(setlists),
      countries: computeCountryStats(setlists),
      cities: computeCityStats(setlists),
      venues: computeVenueStats(setlists),
      albums: computeAlbumCoverage(setlists),
      openers: computeOpeners(setlists),
      closers: computeClosers(setlists),
      uniqueSongs: countUniqueSongs(setlists),
    }
  }, [setlists])

  if (loading) return <div className="loading">Loading setlist data…</div>
  if (error) return <div className="loading">Error: {error}</div>
  if (!setlists.length) return (
    <div className="page-container">
      <div className="empty">
        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No data yet</p>
        <p style={{ fontSize: '0.875rem' }}>Run <code>npm run fetch-data</code> to populate setlist data from setlist.fm.</p>
      </div>
    </div>
  )

  return (
    <div className="page-container">
      <div className="page-heading">
        <h1>All Shows</h1>
        {lastUpdated && (
          <p className="last-updated">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
        )}
      </div>

      <div className="stat-grid">
        <StatCard value={setlists.length.toLocaleString()} label="Total Shows" />
        <StatCard value={stats.countries.length} label="Countries" />
        <StatCard value={stats.cities.length} label="Cities" />
        <StatCard value={stats.venues.length} label="Venues" />
        <StatCard value={stats.uniqueSongs.toLocaleString()} label="Unique Songs" />
        <StatCard value={stats.songs[0]?.name ?? '—'} label="Most Played Song" />
      </div>

      <div className="section">
        <ShowsPerYear data={stats.perYear} />
      </div>

      <div className="section two-col">
        <SongTable songs={stats.songs} />
        <AlbumCoverage data={stats.albums} />
      </div>

      <div className="section">
        <GeoBreakdown countries={stats.countries} cities={stats.cities} />
      </div>

      <div className="section">
        <OpenerCloser openers={stats.openers} closers={stats.closers} />
      </div>

      <div className="section">
        <VenueCard venues={stats.venues} />
      </div>
    </div>
  )
}

function VenueCard({ venues }) {
  const max = venues[0]?.count || 1
  return (
    <div className="card">
      <div className="card-title">Most Visited Venues</div>
      <ol className="ranked-list">
        {venues.slice(0, 15).map((v, i) => (
          <li key={`${v.venue}-${v.city}`}>
            <span className="ranked-list__rank">{i + 1}</span>
            <span className="ranked-list__name">{v.venue}</span>
            <span className="ranked-list__meta">{v.city}</span>
            <div className="ranked-list__bar-wrap">
              <div className="ranked-list__bar" style={{ width: `${Math.round((v.count / max) * 100)}%` }} />
            </div>
            <span className="ranked-list__meta">{v.count}×</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

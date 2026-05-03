import albumData from '../../config/albums.json'

// Build a flat song → album lookup
const songAlbumMap = {}
albumData.forEach(album => {
  album.songs.forEach(song => {
    songAlbumMap[song.toLowerCase()] = album
  })
})

export function getAlbum(songName) {
  return songAlbumMap[songName.toLowerCase()] || null
}

export function computeSongStats(setlists) {
  const map = {}
  setlists.forEach(show => {
    show.songs.forEach(song => {
      if (song.tape) return
      const key = song.name
      if (!map[key]) map[key] = { name: song.name, count: 0, dates: [], album: getAlbum(song.name) }
      map[key].count++
      map[key].dates.push(show.date)
    })
  })
  return Object.values(map).sort((a, b) => b.count - a.count)
}

export function computeShowsPerYear(setlists) {
  const map = {}
  setlists.forEach(show => {
    const year = show.date.slice(0, 4)
    map[year] = (map[year] || 0) + 1
  })
  return Object.entries(map)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year))
}

export function computeCountryStats(setlists) {
  const map = {}
  setlists.forEach(show => {
    const key = show.country
    if (!map[key]) map[key] = { name: show.country, code: show.countryCode, count: 0 }
    map[key].count++
  })
  return Object.values(map).sort((a, b) => b.count - a.count)
}

export function computeCityStats(setlists) {
  const map = {}
  setlists.forEach(show => {
    const key = `${show.city}||${show.country}`
    if (!map[key]) map[key] = { city: show.city, country: show.country, countryCode: show.countryCode, count: 0 }
    map[key].count++
  })
  return Object.values(map).sort((a, b) => b.count - a.count)
}

export function computeVenueStats(setlists) {
  const map = {}
  setlists.forEach(show => {
    const key = `${show.venue}||${show.city}`
    if (!map[key]) map[key] = { venue: show.venue, city: show.city, country: show.country, count: 0 }
    map[key].count++
  })
  return Object.values(map).sort((a, b) => b.count - a.count)
}

export function computeTourStats(setlists) {
  const map = {}
  setlists.forEach(show => {
    const tourName = show.tour || 'Unknown / Standalone'
    if (!map[tourName]) map[tourName] = { name: tourName, shows: [], dates: [] }
    map[tourName].shows.push(show)
    map[tourName].dates.push(show.date)
  })
  return Object.values(map)
    .map(t => ({
      name: t.name,
      count: t.shows.length,
      from: t.dates.reduce((a, b) => (a < b ? a : b)),
      to: t.dates.reduce((a, b) => (a > b ? a : b)),
    }))
    .sort((a, b) => b.from.localeCompare(a.from))
}

export function computeAlbumCoverage(setlists) {
  // Count every performance of each song (not unique songs)
  let totalPlays = 0
  const playsByAlbum = {}
  albumData.forEach(a => { playsByAlbum[a.id] = 0 })

  setlists.forEach(show => {
    show.songs.forEach(song => {
      if (song.tape) return
      totalPlays++
      const album = getAlbum(song.name)
      if (album) playsByAlbum[album.id] = (playsByAlbum[album.id] || 0) + 1
    })
  })

  return albumData.map(album => {
    const plays = playsByAlbum[album.id] || 0
    return {
      id: album.id,
      name: album.name,
      year: album.year,
      color: album.color,
      plays,
      pct: totalPlays ? Math.round((plays / totalPlays) * 100) : 0,
    }
  }).sort((a, b) => b.plays - a.plays)
}

export function computeOpeners(setlists) {
  return computePositionStat(setlists, show => {
    const live = show.songs.filter(s => !s.tape && s.encore === 0)
    return live[0]?.name
  })
}

export function computeClosers(setlists) {
  return computePositionStat(setlists, show => {
    const allLive = show.songs.filter(s => !s.tape)
    return allLive[allLive.length - 1]?.name
  })
}

function computePositionStat(setlists, picker) {
  const map = {}
  setlists.forEach(show => {
    const name = picker(show)
    if (!name) return
    map[name] = (map[name] || 0) + 1
  })
  return Object.entries(map)
    .map(([name, count]) => ({ name, count, album: getAlbum(name) }))
    .sort((a, b) => b.count - a.count)
}

// Returns sorted shows with debut info attached to each song
export function annotateSongDebutDates(setlists) {
  const sortedShows = [...setlists].sort((a, b) => a.date.localeCompare(b.date))
  const firstSeen = {}
  sortedShows.forEach(show => {
    show.songs.forEach(song => {
      if (song.tape) return
      if (!firstSeen[song.name]) firstSeen[song.name] = show.date
    })
  })
  return firstSeen
}

export function getDebutsForShow(show, debutMap) {
  return show.songs.filter(s => !s.tape && debutMap[s.name] === show.date).map(s => s.name)
}

export function countUniqueSongs(setlists) {
  const seen = new Set()
  setlists.forEach(show => show.songs.forEach(s => { if (!s.tape) seen.add(s.name) }))
  return seen.size
}

export function formatDate(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateShort(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Fetches Bloc Party setlists from setlist.fm and writes to public/data/setlists.json.
 *
 * Usage:
 *   SETLISTFM_API_KEY=your_key node scripts/fetch-setlists.mjs           # full sweep
 *   SETLISTFM_API_KEY=your_key node scripts/fetch-setlists.mjs --recent  # recent pages only (merge)
 *
 * Get a free API key at: https://api.setlist.fm/docs/1.0/index.html
 *
 * Bloc Party's MusicBrainz ID: 8c538f11-c141-4588-8ecb-931083524186
 * Verify at: https://www.setlist.fm/setlists/bloc-party-13d6bdc1.html
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '..', 'public', 'data', 'setlists.json')

const API_KEY = process.env.SETLISTFM_API_KEY
const ARTIST_MBID = process.env.BLOC_PARTY_MBID || '8c538f11-c141-4588-8ecb-931083524186'
const BASE_URL = 'https://api.setlist.fm/rest/1.0'
const RECENT_PAGES = 3 // ~60 shows, covers roughly the last year

const RECENT_MODE = process.argv.includes('--recent')

// Custom HTTPS agent — works on systems where Node's bundled CA store
// doesn't include the issuer for api.setlist.fm.
const agent = new https.Agent({ rejectUnauthorized: false })

if (!API_KEY) {
  console.error('Error: SETLISTFM_API_KEY environment variable is not set.')
  console.error('Get a free key at https://api.setlist.fm/docs/1.0/index.html')
  process.exit(1)
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent, headers: { 'x-api-key': API_KEY, 'Accept': 'application/json' } }, res => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, json: () => JSON.parse(data) }))
    }).on('error', reject)
  })
}

async function fetchPage(page) {
  const url = `${BASE_URL}/artist/${ARTIST_MBID}/setlists?p=${page}`
  const res = await httpsGet(url)

  if (res.status === 429) {
    const retryAfter = Number(res.headers['retry-after'] || '10')
    console.log(`Rate limited. Waiting ${retryAfter}s…`)
    await sleep(retryAfter * 1000)
    return fetchPage(page)
  }

  if (res.status !== 200) {
    throw new Error(`API error: ${res.status} (page ${page})`)
  }

  return res.json()
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function parseSongs(sets) {
  const songs = []
  const setList = sets?.set || []
  setList.forEach(set => {
    const encoreNum = set.encore || 0
    ;(set.song || []).forEach(song => {
      if (!song.name?.trim()) return
      songs.push({
        name: song.name.trim(),
        tape: Boolean(song.tape),
        encore: encoreNum,
        cover: song.cover ? { name: song.cover.name } : null,
      })
    })
  })
  return songs
}

function parseShow(setlist) {
  const [d, m, y] = setlist.eventDate.split('-')
  const date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  const venue = setlist.venue || {}
  const city = venue.city || {}
  const country = city.country || {}
  return {
    id: setlist.id,
    date,
    venue: venue.name || '',
    city: city.name || '',
    state: city.state || '',
    country: country.name || '',
    countryCode: country.code || '',
    lat: city.coords?.lat || null,
    lng: city.coords?.long || null,
    tour: setlist.tour?.name || null,
    setlistFmUrl: setlist.url || null,
    songs: parseSongs(setlist.sets),
  }
}

function loadExisting() {
  try {
    return JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'))
  } catch {
    return { setlists: [] }
  }
}

function save(setlists) {
  const withSetlist = setlists.filter(s => s.songs.length > 0).length
  const output = {
    lastUpdated: new Date().toISOString(),
    total: setlists.length,
    totalWithSetlist: withSetlist,
    setlists,
  }
  mkdirSync(join(__dirname, '..', 'public', 'data'), { recursive: true })
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2))
  console.log(`✓ ${setlists.length} shows total (${withSetlist} with setlist, ${setlists.length - withSetlist} without)`)
}

async function fullSweep() {
  console.log('Mode: full sweep')
  const first = await fetchPage(1)
  const total = first.total || 0
  const perPage = first.itemsPerPage || 20
  const totalPages = Math.ceil(total / perPage)
  console.log(`Found ${total} shows across ${totalPages} pages`)

  let all = first.setlist || []
  for (let page = 2; page <= totalPages; page++) {
    console.log(`Fetching page ${page}/${totalPages}…`)
    await sleep(500)
    const data = await fetchPage(page)
    all = all.concat(data.setlist || [])
  }

  const processed = all.map(parseShow).sort((a, b) => b.date.localeCompare(a.date))
  save(processed)
}

async function recentMerge() {
  console.log(`Mode: recent (${RECENT_PAGES} pages) + merge`)
  const existing = loadExisting()
  const byId = new Map(existing.setlists.map(s => [s.id, s]))

  const first = await fetchPage(1)
  let fetched = first.setlist || []

  for (let page = 2; page <= RECENT_PAGES; page++) {
    console.log(`Fetching page ${page}/${RECENT_PAGES}…`)
    await sleep(500)
    const data = await fetchPage(page)
    fetched = fetched.concat(data.setlist || [])
  }

  let added = 0, updated = 0
  fetched.map(parseShow).forEach(show => {
    const prev = byId.get(show.id)
    if (!prev) {
      byId.set(show.id, show)
      added++
    } else if (show.songs.length > prev.songs.length) {
      // Setlist has been filled in or expanded since last fetch
      byId.set(show.id, show)
      updated++
    }
  })

  if (added === 0 && updated === 0) {
    console.log('No changes detected.')
    // Still write to update lastUpdated timestamp
  } else {
    console.log(`${added} new show(s), ${updated} updated setlist(s)`)
  }

  const merged = Array.from(byId.values()).sort((a, b) => b.date.localeCompare(a.date))
  save(merged)
}

async function main() {
  console.log('Fetching Bloc Party setlists from setlist.fm…')
  if (RECENT_MODE) {
    await recentMerge()
  } else {
    await fullSweep()
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})

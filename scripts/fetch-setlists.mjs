/**
 * Fetches all Bloc Party setlists from the setlist.fm API and writes
 * the processed data to public/data/setlists.json.
 *
 * Usage:
 *   SETLISTFM_API_KEY=your_key node scripts/fetch-setlists.mjs
 *
 * Get a free API key at: https://api.setlist.fm/docs/1.0/index.html
 *
 * Bloc Party's MusicBrainz ID: 8c538f11-c141-4588-8ecb-931083524186
 * Verify at: https://www.setlist.fm/setlists/bloc-party-13d6bdc1.html
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '..', 'public', 'data', 'setlists.json')

const API_KEY = process.env.SETLISTFM_API_KEY
const ARTIST_MBID = process.env.BLOC_PARTY_MBID || '8c538f11-c141-4588-8ecb-931083524186'
const BASE_URL = 'https://api.setlist.fm/rest/1.0'

// Use a custom HTTPS agent so the script works on systems where Node's
// bundled CA store doesn't include the issuer for api.setlist.fm.
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
  // setlist.fm date format: DD-MM-YYYY
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

async function main() {
  console.log('Fetching Bloc Party setlists from setlist.fm…')

  // Fetch first page to get total
  const first = await fetchPage(1)
  const total = first.total || 0
  const perPage = first.itemsPerPage || 20
  const totalPages = Math.ceil(total / perPage)

  console.log(`Found ${total} setlists across ${totalPages} pages`)

  let allSetlists = first.setlist || []

  for (let page = 2; page <= totalPages; page++) {
    console.log(`Fetching page ${page}/${totalPages}…`)
    await sleep(500) // be polite to the API
    const data = await fetchPage(page)
    allSetlists = allSetlists.concat(data.setlist || [])
  }

  // Filter out empty setlists (no songs) — these are usually placeholder entries
  const withSongs = allSetlists.filter(s => {
    const songs = s.sets?.set?.flatMap(set => set.song || []) || []
    return songs.length > 0
  })

  console.log(`Processing ${withSongs.length} shows with setlist data (${allSetlists.length - withSongs.length} empty skipped)`)

  const processed = withSongs.map(parseShow)

  // Sort newest first
  processed.sort((a, b) => b.date.localeCompare(a.date))

  const output = {
    lastUpdated: new Date().toISOString(),
    total: processed.length,
    setlists: processed,
  }

  mkdirSync(join(__dirname, '..', 'public', 'data'), { recursive: true })
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2))
  console.log(`✓ Written ${processed.length} shows to ${OUTPUT_PATH}`)
}

main().catch(err => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})

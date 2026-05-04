import { useState, useEffect } from 'react'

export function useSetlists() {
  const [state, setState] = useState({ loading: true, error: null, setlists: [], lastUpdated: null })

  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/'
    const url = `${base}data/setlists.json`.replace('//', '/')

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load data (${r.status})`)
        return r.json()
      })
      .then(data => setState({ loading: false, error: null, setlists: data.setlists || [], lastUpdated: data.lastUpdated, totalWithSetlist: data.totalWithSetlist ?? null }))
      .catch(err => setState({ loading: false, error: err.message, setlists: [], lastUpdated: null }))
  }, [])

  return state
}

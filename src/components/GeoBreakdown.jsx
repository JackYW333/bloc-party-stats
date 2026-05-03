export default function GeoBreakdown({ countries, cities }) {
  const maxC = countries[0]?.count || 1
  const maxCi = cities[0]?.count || 1

  return (
    <div className="two-col">
      <div className="card">
        <div className="card-title">Countries</div>
        <ol className="ranked-list">
          {countries.slice(0, 15).map((c, i) => (
            <li key={c.code || c.name}>
              <span className="ranked-list__rank">{i + 1}</span>
              <span className="ranked-list__name">{c.name}</span>
              <span className="country-code">{c.code}</span>
              <div className="ranked-list__bar-wrap">
                <div className="ranked-list__bar" style={{ width: `${Math.round((c.count / maxC) * 100)}%` }} />
              </div>
              <span className="ranked-list__meta">{c.count}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="card">
        <div className="card-title">Cities</div>
        <ol className="ranked-list">
          {cities.slice(0, 15).map((c, i) => (
            <li key={`${c.city}-${c.country}`}>
              <span className="ranked-list__rank">{i + 1}</span>
              <span className="ranked-list__name">{c.city}</span>
              <span className="ranked-list__meta" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{c.country}</span>
              <div className="ranked-list__bar-wrap">
                <div className="ranked-list__bar" style={{ width: `${Math.round((c.count / maxCi) * 100)}%` }} />
              </div>
              <span className="ranked-list__meta">{c.count}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

import AlbumBadge from './AlbumBadge.jsx'

export default function OpenerCloser({ openers, closers }) {
  return (
    <div className="two-col">
      <RankCard title="Most Common Openers" data={openers} />
      <RankCard title="Most Common Closers" data={closers} />
    </div>
  )
}

function RankCard({ title, data }) {
  const max = data[0]?.count || 1
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <ol className="ranked-list">
        {data.slice(0, 10).map((s, i) => (
          <li key={s.name}>
            <span className="ranked-list__rank">{i + 1}</span>
            <span className="ranked-list__name">{s.name}</span>
            <AlbumBadge album={s.album} />
            <div className="ranked-list__bar-wrap">
              <div className="ranked-list__bar" style={{ width: `${Math.round((s.count / max) * 100)}%` }} />
            </div>
            <span className="ranked-list__meta">{s.count}×</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

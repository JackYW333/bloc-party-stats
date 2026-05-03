export default function AlbumCoverage({ data }) {
  return (
    <div className="card">
      <div className="card-title">Songs by Release</div>
      <ul className="album-coverage-list">
        {data.filter(a => a.plays > 0).map(album => (
          <li key={album.id} className="album-coverage-item">
            <div className="album-coverage-item__header">
              <span className="album-coverage-item__name">{album.name}</span>
              <span className="album-coverage-item__meta">{album.plays} plays · {album.pct}%</span>
            </div>
            <div className="album-coverage-item__track">
              <div
                className="album-coverage-item__fill"
                style={{ width: `${album.pct}%`, background: album.color }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

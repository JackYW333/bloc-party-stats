export default function AlbumBadge({ album }) {
  if (!album) return null
  return (
    <span
      className="album-badge"
      style={{ background: album.color + '22', color: album.color, border: `1px solid ${album.color}44` }}
      title={`${album.name} (${album.year})`}
    >
      {album.name.replace('A Weekend in the City', 'AWTIC').replace('Alpha Games', 'α Games')}
    </span>
  )
}

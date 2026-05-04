import { Link } from 'react-router-dom'

function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b
}

export default function AlbumBadge({ album }) {
  if (!album) return null
  const textColor = luminance(album.color) > 0.45 ? '#111' : '#fff'
  return (
    <Link
      to={`/album/${album.id}`}
      className="album-badge"
      style={{ background: album.color, color: textColor, border: `1px solid ${album.color}` }}
      title={album.year ? `${album.name} (${album.year})` : album.name}
    >
      {album.name.replace('A Weekend in the City', 'AWITC')}
    </Link>
  )
}

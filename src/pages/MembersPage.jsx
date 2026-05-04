import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import membersConfig from '../../config/members.json'

function isInPeriod(date, periods) {
  return periods.some(p => {
    const from = p.from
    const to = p.to || '9999-12-31'
    return date >= from && date <= to
  })
}

export default function MembersPage({ data }) {
  const { loading, error, setlists } = data

  const memberStats = useMemo(() => {
    if (!setlists.length) return membersConfig.members.map(m => ({ ...m, showCount: 0, firstShow: null, lastShow: null }))

    const sorted = [...setlists].sort((a, b) => a.date.localeCompare(b.date))

    return membersConfig.members.map(member => {
      const shows = sorted.filter(show => isInPeriod(show.date, member.periods))
      return {
        ...member,
        showCount: shows.length,
        firstShow: shows[0] || null,
        lastShow: shows[shows.length - 1] || null,
      }
    })
  }, [setlists])

  const formatPeriods = (periods) => {
    return periods.map(p => {
      const from = p.from ? p.from.slice(0, 7) : '?'
      const to = p.to ? p.to.slice(0, 7) : 'present'
      return `${from} – ${to}`
    }).join(', ')
  }

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>

  return (
    <div className="page-container">
      <div className="page-heading">
        <h1>Band Members</h1>
        <p className="sub">Show counts calculated from membership date ranges</p>
      </div>

      <div className="member-grid">
        {memberStats.map(member => (
          <Link key={member.id} to={`/member/${member.id}`} className="member-card" style={{ display: 'block', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div
              style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--bg-hover)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.75rem',
                fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 700,
              }}
            >
              {member.name.charAt(0)}
            </div>
            <div className="member-card__name">{member.name}</div>
            <div className="member-card__role">{member.role}</div>
            <div className="member-card__shows">{member.showCount.toLocaleString()}</div>
            <div className="member-card__shows-label">shows</div>
            <div className="member-card__period">{formatPeriods(member.periods)}</div>
            {member.firstShow && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                First: <Link to={`/concert/${member.firstShow.id}`} style={{ color: 'var(--text-dim)' }}>{member.firstShow.date}</Link>
                {member.lastShow && member.lastShow.id !== member.firstShow.id && (
                  <> · Last: <Link to={`/concert/${member.lastShow.id}`} style={{ color: 'var(--text-dim)' }}>{member.lastShow.date}</Link></>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
          Show counts are calculated by matching each concert's date against each member's active period(s) as defined in{' '}
          <code style={{ fontSize: '0.75rem', background: 'var(--bg-card)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>
            config/members.json
          </code>
          . Edit that file to correct membership dates or add non-consecutive periods.
        </p>
      </div>
    </div>
  )
}

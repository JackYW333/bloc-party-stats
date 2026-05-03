import { Routes, Route, NavLink } from 'react-router-dom'
import Overview from './pages/Overview.jsx'
import ToursPage from './pages/ToursPage.jsx'
import TourPage from './pages/TourPage.jsx'
import ConcertPage from './pages/ConcertPage.jsx'
import MembersPage from './pages/MembersPage.jsx'
import { useSetlists } from './hooks/useSetlists.js'

export default function App() {
  const data = useSetlists()

  return (
    <>
      <header className="site-header">
        <NavLink to="/" className="site-logo">
          Bloc Party <span>Stats</span>
        </NavLink>
        <nav className="site-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Overview</NavLink>
          <NavLink to="/tours" className={({ isActive }) => isActive ? 'active' : ''}>Tours</NavLink>
          <NavLink to="/members" className={({ isActive }) => isActive ? 'active' : ''}>Members</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Overview data={data} />} />
        <Route path="/tours" element={<ToursPage data={data} />} />
        <Route path="/tour/:tourName" element={<TourPage data={data} />} />
        <Route path="/concert/:id" element={<ConcertPage data={data} />} />
        <Route path="/members" element={<MembersPage data={data} />} />
      </Routes>
    </>
  )
}

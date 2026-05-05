import { Routes, Route, NavLink } from 'react-router-dom'
import Overview from './pages/Overview.jsx'
import ToursPage from './pages/ToursPage.jsx'
import TourPage from './pages/TourPage.jsx'
import ConcertPage from './pages/ConcertPage.jsx'
import MembersPage from './pages/MembersPage.jsx'
import SongPage from './pages/SongPage.jsx'
import AlbumPage from './pages/AlbumPage.jsx'
import ReleasesPage from './pages/ReleasesPage.jsx'
import VenuePage from './pages/VenuePage.jsx'
import DebutsPage from './pages/DebutsPage.jsx'
import AllCountriesPage from './pages/AllCountriesPage.jsx'
import AllCitiesPage from './pages/AllCitiesPage.jsx'
import AllShowsPage from './pages/AllShowsPage.jsx'
import AllVenuesPage from './pages/AllVenuesPage.jsx'
import AllSongsPage from './pages/AllSongsPage.jsx'
import MemberPage from './pages/MemberPage.jsx'
import YearPage from './pages/YearPage.jsx'
import CountryPage from './pages/CountryPage.jsx'
import CityPage from './pages/CityPage.jsx'
import { useSetlists } from './hooks/useSetlists.js'
import Search from './components/Search.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'

export default function App() {
  const data = useSetlists()

  return (
    <>
      <ScrollToTop />
      <header className="site-header">
        <NavLink to="/" className="site-logo">
          Bloc Party <span>Stats</span>
        </NavLink>
        <Search setlists={data.setlists} />
        <nav className="site-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Overview</NavLink>
          <NavLink to="/tours" className={({ isActive }) => isActive ? 'active' : ''}>Tours</NavLink>
          <NavLink to="/releases" className={({ isActive }) => isActive ? 'active' : ''}>Releases</NavLink>
          <NavLink to="/debuts" className={({ isActive }) => isActive ? 'active' : ''}>Debuts</NavLink>
          <NavLink to="/members" className={({ isActive }) => isActive ? 'active' : ''}>Members</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Overview data={data} />} />
        <Route path="/tours" element={<ToursPage data={data} />} />
        <Route path="/tour/:tourName" element={<TourPage data={data} />} />
        <Route path="/concert/:id" element={<ConcertPage data={data} />} />
        <Route path="/members" element={<MembersPage data={data} />} />
        <Route path="/song/:songName" element={<SongPage data={data} />} />
        <Route path="/year/:year" element={<YearPage data={data} />} />
        <Route path="/country/:countryCode" element={<CountryPage data={data} />} />
        <Route path="/city/:cityName/:countryCode" element={<CityPage data={data} />} />
        <Route path="/releases" element={<ReleasesPage data={data} />} />
        <Route path="/album/:albumId" element={<AlbumPage data={data} />} />
        <Route path="/venue/:venueName/:cityName/:countryCode" element={<VenuePage data={data} />} />
        <Route path="/debuts" element={<DebutsPage data={data} />} />
        <Route path="/countries" element={<AllCountriesPage data={data} />} />
        <Route path="/cities" element={<AllCitiesPage data={data} />} />
        <Route path="/shows" element={<AllShowsPage data={data} />} />
        <Route path="/venues" element={<AllVenuesPage data={data} />} />
        <Route path="/songs" element={<AllSongsPage data={data} />} />
        <Route path="/member/:memberId" element={<MemberPage data={data} />} />
      </Routes>
    </>
  )
}

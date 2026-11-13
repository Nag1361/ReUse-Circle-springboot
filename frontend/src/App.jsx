import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { readSession, saveSession } from './api';
import Browse from './pages/Browse';
import Auth from './pages/Auth';
import ListingDetails from './pages/ListingDetails';
import ListingForm from './pages/ListingForm';
import MyListings from './pages/MyListings';
import Requests from './pages/Requests';

function Protected({ session, children }) {
  const location = useLocation();
  return session ? children : <Navigate to="/login" state={{ from: location.pathname }} replace />;
}

export default function App() {
  const [session, setSession] = useState(readSession);
  const navigate = useNavigate();
  function handleAuth(nextSession) {
    saveSession(nextSession);
    setSession(nextSession);
  }
  function logout() {
    handleAuth(null);
    navigate('/');
  }
  useEffect(() => {
    function expire() { setSession(null); }
    window.addEventListener('session-expired', expire);
    // Keep navigation accurate even if the tab sits idle past token expiry.
    const timer = setInterval(() => {
      if (!readSession()) setSession(null);
    }, 30000);
    return () => { window.removeEventListener('session-expired', expire); clearInterval(timer); };
  }, []);

  return <>
    <header className="site-header">
      <nav className="nav container" aria-label="Main navigation">
        <Link className="brand" to="/"><span className="brand-icon" aria-hidden="true">↻</span> ReUseCircle</Link>
        <div className="nav-links">
          <NavLink to="/" end>Browse</NavLink>
          {session ? <>
            <NavLink to="/my-listings">My Listings</NavLink>
            <NavLink to="/my-requests">My Requests</NavLink>
            <NavLink to="/received-requests">Received Requests</NavLink>
            <NavLink className="nav-create" to="/listings/new">Give an item</NavLink>
            <button className="button secondary small" onClick={logout}>Logout</button>
          </> : <><NavLink to="/login">Login</NavLink><NavLink className="nav-create" to="/register">Join the circle</NavLink></>}
        </div>
      </nav>
    </header>
    <main className="container main-content">
      <Routes>
        <Route path="/" element={<Browse />} />
        <Route path="/login" element={<Auth onAuth={handleAuth} session={session} />} />
        <Route path="/register" element={<Auth key="register" register onAuth={handleAuth} session={session} />} />
        <Route path="/listings/new" element={<Protected session={session}><ListingForm session={session} /></Protected>} />
        <Route path="/listings/:id/edit" element={<Protected session={session}><ListingForm session={session} /></Protected>} />
        <Route path="/listings/:id" element={<ListingDetails session={session} />} />
        <Route path="/my-listings" element={<Protected session={session}><MyListings /></Protected>} />
        <Route path="/my-requests" element={<Protected session={session}><Requests key="sent" /></Protected>} />
        <Route path="/received-requests" element={<Protected session={session}><Requests key="received" received /></Protected>} />
        <Route path="*" element={<div className="empty"><h1>Page not found</h1><Link to="/">Back to browse</Link></div>} />
      </Routes>
    </main>
    <footer className="footer container"><span>ReUseCircle</span><span>Less waste. More possibility. Always free.</span></footer>
  </>;
}

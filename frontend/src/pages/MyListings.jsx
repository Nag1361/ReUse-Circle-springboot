import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api';
import ListingCard from '../components/ListingCard';
import Message from '../components/Message';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const [success, setSuccess] = useState(location.state?.success || '');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    api('/me/listings').then(data => { if (active) setListings(data); })
      .catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function action(item, remove) {
    if (remove && !window.confirm('Delete this listing and its requests? This cannot be undone.')) return;
    setBusy(true); setError(''); setSuccess('');
    try {
      const updated = await api(`/listings/${item.id}${remove ? '' : '/collected'}`, { method: remove ? 'DELETE' : 'PATCH' });
      setListings(current => remove ? current.filter(row => row.id !== item.id) : current.map(row => row.id === item.id ? updated : row));
      setSuccess(remove ? 'Listing deleted.' : 'Item marked as collected.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <>
    <div className="section-heading"><div><p className="eyebrow">YOUR CONTRIBUTIONS</p><h1>My Listings</h1><p className="muted">Manage the things you’re passing on.</p></div><Link className="button" to="/listings/new">+ Give an item</Link></div>
    <Message loading={loading} error={error} success={success} />
    {!loading && !error && listings.length === 0 && <div className="empty"><h2>Your next act of generosity starts here</h2><p>Create your first giveaway listing.</p></div>}
    <div className="listing-grid">{listings.map(item => <ListingCard key={item.id} listing={item}>
      {item.status === 'AVAILABLE' && <Link className="button secondary small" to={`/listings/${item.id}/edit`}>Edit</Link>}
      {item.status === 'RESERVED' && <button className="button small" onClick={() => action(item, false)} disabled={busy}>Mark as Collected</button>}
      <button className="button danger small" onClick={() => action(item, true)} disabled={busy}>Delete</button>
    </ListingCard>)}</div>
  </>;
}

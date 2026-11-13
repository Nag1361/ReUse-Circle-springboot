import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import ItemImage from '../components/ItemImage';
import Message from '../components/Message';

export default function ListingDetails({ session }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [listing, setListing] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [requested, setRequested] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setSuccess(''); setRequested(false); setMessage('');
    api(`/listings/${id}`).then(data => { if (active) setListing(data); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  const isOwner = session?.user.id === listing?.ownerId;
  async function requestItem(event) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try {
      await api(`/listings/${id}/requests`, { method: 'POST', body: JSON.stringify({ message }) });
      setRequested(true); setSuccess('Request sent. You can track it in My Requests.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function collected() {
    setBusy(true); setError(''); setSuccess('');
    try { setListing(await api(`/listings/${id}/collected`, { method: 'PATCH' })); setSuccess('Item marked as collected. Thank you for sharing!'); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!window.confirm('Delete this listing and all its requests? This cannot be undone.')) return;
    setBusy(true); setError('');
    try { await api(`/listings/${id}`, { method: 'DELETE' }); navigate('/my-listings', { state: { success: 'Listing deleted.' } }); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  if (loading) return <Message loading />;
  if (!listing) return <><Message error={error} /><Link to="/">Back to browse</Link></>;
  return <>
    <Link className="back-link" to="/">← Back to the board</Link>
    <Message error={error} success={success || location.state?.success} />
    <section className="detail-layout">
      <div className="detail-image"><ItemImage src={listing.imageUrl} title={listing.title} /></div>
      <div className="detail-content">
        <div className="card-top"><span className="eyebrow">{listing.category}</span><span className={`badge ${listing.status.toLowerCase()}`}>{listing.status}</span></div>
        <h1>{listing.title}</h1><p className="price">Free to a good home</p>
        <dl className="facts"><div><dt>Condition</dt><dd>{listing.condition}</dd></div><div><dt>Pickup area</dt><dd>{listing.pickupArea}</dd></div><div><dt>Shared by</dt><dd>{listing.ownerName}</dd></div></dl>
        <h2>About this item</h2><p className="description">{listing.description}</p>
        {isOwner ? <div className="owner-panel"><h3>This is your listing</h3><div className="actions">
          {listing.status === 'AVAILABLE' && <Link className="button secondary" to={`/listings/${id}/edit`}>Edit listing</Link>}
          <Link className="button secondary" to="/received-requests">View requests</Link>
          {listing.status === 'RESERVED' && <button className="button" disabled={busy} onClick={collected}>Mark as Collected</button>}
          <button className="button danger" disabled={busy} onClick={remove}>Delete</button>
        </div></div> : listing.status !== 'AVAILABLE' ? <p className="notice">This item is {listing.status.toLowerCase()} and is no longer accepting requests.</p> : !session ? <p className="notice"><Link to="/login" state={{ from: `/listings/${id}` }}>Login</Link> to request this item.</p> : requested ? <Link className="button secondary" to="/my-requests">View My Requests</Link> : <form className="stack request-form" onSubmit={requestItem}>
          <label>Message to the owner <span className="muted">(optional)</span><textarea value={message} onChange={event => setMessage(event.target.value)} maxLength={500} rows={3} placeholder="Introduce yourself or suggest a pickup time." /></label>
          <button className="button" disabled={busy}>{busy ? 'Sending…' : 'Request this item'}</button>
        </form>}
      </div>
    </section>
  </>;
}

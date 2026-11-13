import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Message from '../components/Message';

export default function Requests({ received = false }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const endpoint = received ? '/me/received-requests' : '/me/requests';
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    api(endpoint).then(data => { if (active) setRequests(data); })
      .catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [endpoint]);
  async function decide(id, status) {
    setBusy(true); setError(''); setSuccess('');
    try {
      await api(`/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      // Refresh all requests: accepting one also changes the other requests for that item.
      setRequests(await api(endpoint));
      setSuccess(status === 'ACCEPTED' ? 'Request accepted. The item is reserved; other pending requests were declined.' : 'Request declined.');
    } catch (err) {
      setError(err.message);
      try { setRequests(await api(endpoint)); } catch { /* Keep the original useful error. */ }
    } finally { setBusy(false); }
  }
  return <>
    <div className="section-heading"><div><p className="eyebrow">{received ? 'FIND YOUR ITEM A NEW HOME' : 'YOUR COMMUNITY CONNECTIONS'}</p><h1>{received ? 'Received Requests' : 'My Requests'}</h1><p className="muted">{received ? 'Choose who will receive the items you’re sharing.' : 'Track the items you’ve asked for.'}</p></div></div>
    <Message loading={loading} error={error} success={success} />
    {!loading && requests.length === 0 && !error && <div className="empty"><h2>No requests yet</h2><p>{received ? 'Requests for your listings will appear here.' : 'Browse the board to find something useful.'}</p><Link to={received ? '/my-listings' : '/'}>{received ? 'My Listings' : 'Browse listings'} →</Link></div>}
    <div className="request-list">{requests.map(request => <article className="request-card" key={request.id}>
      <div className="request-heading"><div><h2><Link to={`/listings/${request.listingId}`}>{request.listingTitle}</Link></h2><p className="muted">{received ? `From ${request.requesterName} · ` : ''}Item: {request.listingStatus.toLowerCase()}</p></div><span className={`badge ${request.status.toLowerCase()}`}>{request.status}</span></div>
      <p className="request-message">{request.message || 'No message added.'}</p>
      {received && request.status === 'PENDING' && request.listingStatus === 'AVAILABLE' && <div className="actions"><button className="button small" disabled={busy} onClick={() => decide(request.id, 'ACCEPTED')}>Accept</button><button className="button secondary small" disabled={busy} onClick={() => decide(request.id, 'DECLINED')}>Decline</button></div>}
      {request.status === 'ACCEPTED' && <p className="request-note">{request.listingStatus === 'COLLECTED' ? 'This item has been collected.' : received ? 'Reserved for this requester. Mark it collected from My Listings after pickup.' : 'Your request was accepted! The item is reserved for you.'}</p>}
    </article>)}</div>
  </>;
}

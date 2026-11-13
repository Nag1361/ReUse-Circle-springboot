import { Link } from 'react-router-dom';
import ItemImage from './ItemImage';
export default function ListingCard({ listing, children }) {
  return <article className="listing-card">
    <Link className="card-image-link" to={`/listings/${listing.id}`}><ItemImage src={listing.imageUrl} title={listing.title} /></Link>
    <div className="card-content">
      <div className="card-top"><span className="eyebrow">{listing.category}</span><span className={`badge ${listing.status.toLowerCase()}`}>{listing.status}</span></div>
      <h2><Link to={`/listings/${listing.id}`}>{listing.title}</Link></h2>
      <p className="muted">{listing.condition} · {listing.pickupArea}</p>
      <div className="card-bottom"><span className="free">FREE</span><Link to={`/listings/${listing.id}`}>View item →</Link></div>
      {children && <div className="actions card-actions">{children}</div>}
    </div>
  </article>;
}

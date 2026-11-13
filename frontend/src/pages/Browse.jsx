import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { categories, conditions } from '../options';
import ListingCard from '../components/ListingCard';
import Message from '../components/Message';

export default function Browse() {
  const [filters, setFilters] = useState({ search: '', category: '', condition: '', status: '' });
  const [query, setQuery] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    api(`/listings?${query}`).then(data => { if (active) setListings(data); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query]);
  function change(event) { setFilters({ ...filters, [event.target.name]: event.target.value }); }
  function search(event) { event.preventDefault(); setQuery(new URLSearchParams(filters).toString()); }
  function reset() { setFilters({ search: '', category: '', condition: '', status: '' }); setQuery(''); }

  return <>
    <section className="hero">
      <div><p className="eyebrow">GOOD THINGS DESERVE ANOTHER CHAPTER</p>
        <h1>Someone’s extra.<br /><span>Someone’s everything.</span></h1>
        <p className="hero-copy">Pass on what you no longer need. Find something you’ll love.<br className="desktop-break" /> A little generosity goes a long way.</p>
        <Link className="button" to="/listings/new">Give something away <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="hero-note"><span className="circle-symbol" aria-hidden="true">↻</span><strong>Keep good things<br />going around.</strong><p>Shared locally. Given freely.</p></div>
    </section>
    <section aria-labelledby="browse-title">
      <div className="section-heading"><div><p className="eyebrow">THE COMMUNITY BOARD</p><h2 id="browse-title">Find its next home</h2></div><span className="muted">Every item is free.</span></div>
      <form className="filters" onSubmit={search}>
        <label className="search-field">Search by title<input name="search" value={filters.search} onChange={change} placeholder="Try books, chair, lamp…" maxLength={120} /></label>
        <label>Category<select name="category" value={filters.category} onChange={change}><option value="">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
        <label>Condition<select name="condition" value={filters.condition} onChange={change}><option value="">Any condition</option>{conditions.map(c => <option key={c}>{c}</option>)}</select></label>
        <label>Availability<select name="status" value={filters.status} onChange={change}><option value="">All statuses</option><option value="AVAILABLE">Available</option><option value="RESERVED">Reserved</option><option value="COLLECTED">Collected</option></select></label>
        <button className="button" type="submit">Search</button><button className="button secondary" type="button" onClick={reset}>Reset</button>
      </form>
      <Message loading={loading} error={error} />
      {!loading && !error && (listings.length ? <><p className="result-count">{listings.length} {listings.length === 1 ? 'item' : 'items'} on the board</p><div className="listing-grid">{listings.map(item => <ListingCard key={item.id} listing={item} />)}</div></> : <div className="empty"><h3>No items found yet</h3><p>Try different filters or be the first to give something away.</p><Link to="/listings/new">Create a listing →</Link></div>)}
    </section>
  </>;
}

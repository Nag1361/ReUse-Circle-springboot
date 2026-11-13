import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { categories, conditions } from '../options';
import Message from '../components/Message';

const emptyForm = { title: '', category: 'Books', condition: 'Good', description: '', pickupArea: '', imageUrl: '' };
export default function ListingForm({ session }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');
  const [canEdit, setCanEdit] = useState(!id);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!id) { setForm(emptyForm); setCanEdit(true); setLoading(false); setError(''); return; }
    let active = true;
    setLoading(true); setError(''); setCanEdit(false);
    api(`/listings/${id}`).then(item => {
      if (!active) return;
      if (item.ownerId !== session.user.id) { setError('You can only edit your own listings.'); return; }
      if (item.status !== 'AVAILABLE') { setError('Only available listings can be edited.'); return; }
      setForm({ title: item.title, category: item.category, condition: item.condition, description: item.description, pickupArea: item.pickupArea, imageUrl: item.imageUrl || '' });
      setCanEdit(true);
    }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, session.user.id]);
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) {
    event.preventDefault(); setError('');
    const body = {};
    for (const key of Object.keys(form)) body[key] = form[key].trim();
    for (const key of ['title', 'category', 'condition', 'description', 'pickupArea']) {
      if (!body[key]) { setError('Please fill in all required fields.'); return; }
    }
    if (body.imageUrl) {
      try {
        const url = new URL(body.imageUrl);
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error();
      } catch { setError('Use a valid http or https image URL, or leave it blank.'); return; }
    }
    setBusy(true);
    try {
      const data = await api(id ? `/listings/${id}` : '/listings', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
      navigate(`/listings/${data.id}`, { replace: true, state: { success: id ? 'Listing updated.' : 'Your listing is live. Thank you for sharing!' } });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <section className="form-panel listing-form-panel">
    <p className="eyebrow">MAKE ROOM FOR SOMETHING GOOD</p><h1>{id ? 'Edit your listing' : 'Give it a new beginning'}</h1>
    <p className="muted">Everything shared here is free. Add a few details to help it find the right home.</p>
    <Message loading={loading} error={error} />
    {!loading && canEdit && <form className="stack" onSubmit={submit}>
      <label>Title<input name="title" value={form.title} onChange={change} required maxLength={120} placeholder="e.g. Wooden study chair" /></label>
      <div className="form-row">
        <label>Category<select name="category" value={form.category} onChange={change} required>{!categories.includes(form.category) && <option>{form.category}</option>}{categories.map(c => <option key={c}>{c}</option>)}</select></label>
        <label>Condition<select name="condition" value={form.condition} onChange={change} required>{!conditions.includes(form.condition) && <option>{form.condition}</option>}{conditions.map(c => <option key={c}>{c}</option>)}</select></label>
      </div>
      <label>Description<textarea name="description" value={form.description} onChange={change} required maxLength={2000} rows={5} placeholder="Describe the item, including any wear or useful details." /></label>
      <label>Pickup area<input name="pickupArea" value={form.pickupArea} onChange={change} required maxLength={160} placeholder="e.g. Hanamkonda, near university" /></label>
      <label>Image URL <span className="muted">(optional)</span><input type="url" name="imageUrl" value={form.imageUrl} onChange={change} maxLength={1000} placeholder="https://example.com/item.jpg" /></label>
      <small className="muted">Use a direct public image URL. A placeholder appears if the image cannot load.</small>
      <div className="actions"><button className="button" disabled={busy}>{busy ? 'Saving…' : id ? 'Save changes' : 'Publish listing'}</button><Link className="button secondary" to={id ? `/listings/${id}` : '/my-listings'}>Cancel</Link></div>
    </form>}
  </section>;
}

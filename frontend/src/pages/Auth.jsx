import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Message from '../components/Message';

export default function Auth({ register = false, onAuth, session }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from || '/';
  if (session) return <Navigate to={destination} replace />;
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) {
    event.preventDefault(); setError('');
    if (register && !form.name.trim()) return setError('Enter your name.');
    if (new TextEncoder().encode(form.password).length > 72) return setError('Password must be at most 72 UTF-8 bytes.');
    setBusy(true);
    try {
      const body = register ? { ...form, name: form.name.trim(), email: form.email.trim() } : { email: form.email.trim(), password: form.password };
      const data = await api(`/auth/${register ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(body) });
      onAuth(data); navigate(destination, { replace: true });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <section className="form-panel auth-panel">
    <p className="eyebrow">WELCOME TO THE CIRCLE</p><h1>{register ? 'A little giving starts here.' : 'Good to see you again.'}</h1>
    <p className="muted">{register ? 'Create an account to share items and send requests.' : 'Log in to continue sharing with your community.'}</p>
    <Message error={error} />
    <form className="stack" onSubmit={submit}>
      {register && <label>Name<input name="name" autoComplete="name" value={form.name} onChange={change} required maxLength={80} /></label>}
      <label>Email<input type="email" name="email" autoComplete="email" value={form.email} onChange={change} required maxLength={160} /></label>
      <label>Password<input type="password" name="password" autoComplete={register ? 'new-password' : 'current-password'} value={form.password} onChange={change} required minLength={register ? 8 : 1} maxLength={72} /></label>
      {register && <small className="muted">Use at least 8 characters, up to 72 UTF-8 bytes.</small>}
      <button className="button" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Login'}</button>
    </form>
    <p className="form-foot">{register ? 'Already a member? ' : 'New here? '}<Link to={register ? '/login' : '/register'} state={{ from: destination }}>{register ? 'Login' : 'Create an account'}</Link></p>
  </section>;
}

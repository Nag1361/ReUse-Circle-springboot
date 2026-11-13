export default function Message({ error, success, loading }) {
  return <>
    {loading && <p className="notice" role="status">Loading…</p>}
    {error && <p className="notice error" role="alert">{error}</p>}
    {success && <p className="notice success" role="status">{success}</p>}
  </>;
}

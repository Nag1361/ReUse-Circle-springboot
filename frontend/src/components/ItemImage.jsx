import { useEffect, useState } from 'react';
export default function ItemImage({ src, title }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  if (!src || failed) return <div className="image-placeholder" role="img" aria-label={`No image for ${title}`}>
    <span aria-hidden="true">↻</span><small>A new home awaits</small>
  </div>;
  return <img className="item-image" src={src} alt={title} onError={() => setFailed(true)} loading="lazy" referrerPolicy="no-referrer" />;
}

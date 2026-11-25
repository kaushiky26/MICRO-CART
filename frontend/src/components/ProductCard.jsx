import { useState } from 'react';

export default function ProductCard({ product, busy, disabled, onBuy, format }) {
  const [qty, setQty] = useState(1);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <article className="card">
      <div className="card__media">
        {imgFailed ? (
          <div className="card__fallback">{product.name.charAt(0)}</div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        )}
        <span className="card__id">#{product.id}</span>
      </div>

      <div className="card__body">
        <h3>{product.name}</h3>
        <p className="card__desc">{product.description}</p>

        <div className="card__foot">
          <span className="card__price">{format(product.price)}</span>

          <div className="qty">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={busy}
            >
              −
            </button>
            <span>{qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQty((q) => Math.min(99, q + 1))}
              disabled={busy}
            >
              +
            </button>
          </div>
        </div>

        <button
          className="btn btn--primary btn--block"
          onClick={() => onBuy(product, qty)}
          disabled={disabled || busy}
        >
          {busy ? 'Placing order…' : 'Buy Now'}
        </button>
      </div>
    </article>
  );
}

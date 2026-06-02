import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PRODUCTS } from '../../data/products';
import { useT } from '../../i18n/useT';
import { formatPrice } from '../../i18n/currency';

export const Checkout = () => {
  const { state, clearCart } = useApp();
  const tt = useT();
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [placed, setPlaced] = useState<string | null>(null);

  const rows = state.cart
    .map((i) => {
      const p = PRODUCTS.find((x) => x.id === i.productId);
      return p ? { ...p, qty: i.qty, total: p.price * i.qty } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const total = rows.reduce((acc, r) => acc + r.total, 0);
  const isLoggedIn = state.auth !== 'anon';

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    setPlaced(orderId);
    clearCart();
  };

  if (placed) {
    return (
      <section data-testid="page-checkout-success">
        <h1 data-testid="order-success-title">{tt('checkout.success.title')}</h1>
        <p data-testid="order-id">
          {tt('checkout.success.orderId')} {placed}
        </p>
      </section>
    );
  }

  if (rows.length === 0) {
    return (
      <section data-testid="page-checkout-empty">
        <h1>{tt('checkout.title')}</h1>
        <p>{tt('checkout.empty')}</p>
      </section>
    );
  }

  if (!isLoggedIn) {
    return (
      <section data-testid="page-checkout-login-required">
        <h1>{tt('checkout.title')}</h1>
        <p data-testid="checkout-login-msg">{tt('checkout.loginRequired')}</p>
        <Link
          to="/ecommerce/login?redirect=/ecommerce/checkout"
          className="btn"
          data-testid="checkout-go-login"
          style={{ marginTop: 12, display: 'inline-block' }}
        >
          {tt('checkout.goLogin')}
        </Link>
      </section>
    );
  }

  return (
    <section data-testid="page-checkout">
      <h1>{tt('checkout.title')}</h1>
      <table className="simple" data-testid="checkout-summary">
        <thead>
          <tr>
            <th>{tt('checkout.item')}</th>
            <th>{tt('checkout.qty')}</th>
            <th>{tt('checkout.total')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.qty}</td>
              <td>{formatPrice(r.total, state.currency)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={2} style={{ textAlign: 'right' }}>
              <strong>{tt('checkout.total')}</strong>
            </td>
            <td data-testid="checkout-total">
              <strong>{formatPrice(total, state.currency)}</strong>
            </td>
          </tr>
        </tbody>
      </table>
      <form className="form-grid" onSubmit={placeOrder} style={{ marginTop: 16 }}>
        <textarea
          rows={3}
          placeholder={tt('checkout.address')}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          data-testid="checkout-address"
        />
        <input
          type="text"
          placeholder={tt('checkout.cardName')}
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          required
          data-testid="checkout-card-name"
        />
        <input
          type="text"
          placeholder={tt('checkout.cardNumber')}
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          required
          data-testid="checkout-card-number"
        />
        <button type="submit" className="btn" data-testid="checkout-place-order">
          {tt('checkout.placeOrder')}
        </button>
      </form>
    </section>
  );
};

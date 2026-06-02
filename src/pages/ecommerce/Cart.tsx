import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PRODUCTS } from '../../data/products';
import { useT } from '../../i18n/useT';
import { formatPrice } from '../../i18n/currency';

export const Cart = () => {
  const { state, removeFromCart, clearCart } = useApp();
  const tt = useT();

  const rows = state.cart
    .map((i) => {
      const p = PRODUCTS.find((x) => x.id === i.productId);
      return p ? { ...p, qty: i.qty, total: p.price * i.qty } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const total = rows.reduce((acc, r) => acc + r.total, 0);

  return (
    <section data-testid="page-cart">
      <h1>{tt('cart.title')}</h1>
      {rows.length === 0 ? (
        <p data-testid="cart-empty">{tt('cart.empty')}</p>
      ) : (
        <>
          <table className="simple" data-testid="cart-table">
            <thead>
              <tr>
                <th>{tt('cart.item')}</th>
                <th>{tt('cart.price')}</th>
                <th>{tt('cart.qty')}</th>
                <th>{tt('cart.total')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} data-testid={`cart-row-${r.id}`}>
                  <td>{r.name}</td>
                  <td>{formatPrice(r.price, state.currency)}</td>
                  <td data-testid={`cart-qty-${r.id}`}>{r.qty}</td>
                  <td data-testid={`cart-total-${r.id}`}>{formatPrice(r.total, state.currency)}</td>
                  <td>
                    <button
                      className="btn secondary"
                      onClick={() => removeFromCart(r.id)}
                      data-testid={`cart-remove-${r.id}`}
                    >
                      x
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: 'right' }}>
                  <strong>{tt('cart.grandTotal')}</strong>
                </td>
                <td data-testid="cart-grand-total">
                  <strong>{formatPrice(total, state.currency)}</strong>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          <div className="flex-row" style={{ marginTop: 16 }}>
            <button className="btn secondary" onClick={clearCart} data-testid="cart-clear">
              {tt('cart.clear')}
            </button>
            <Link to="/ecommerce/checkout" className="btn" data-testid="cart-checkout-btn">
              {tt('cart.checkout')}
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

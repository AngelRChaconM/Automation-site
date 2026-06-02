import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, apiGetOrders, type OrderRecord } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { useProducts } from '../../hooks/useProducts';
import { useT } from '../../i18n/useT';
import { formatPrice } from '../../i18n/currency';

export const Orders = () => {
  const { state } = useApp();
  const { products } = useProducts();
  const tt = useT();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = state.auth !== 'anon';

  useEffect(() => {
    if (!isLoggedIn) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    apiGetOrders()
      .then((res) => {
        if (!cancelled) setOrders(res.orders);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setOrders([]);
          setError(err instanceof ApiError ? err.message : err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <section data-testid="page-orders-login-required">
        <h1>{tt('orders.title')}</h1>
        <p data-testid="orders-login-msg">{tt('orders.loginRequired')}</p>
        <Link to="/ecommerce/login?redirect=/ecommerce/orders" className="btn" data-testid="orders-go-login">
          {tt('checkout.goLogin')}
        </Link>
      </section>
    );
  }

  return (
    <section data-testid="page-orders">
      <h1>{tt('orders.title')}</h1>
      {loading ? (
        <p className="muted" data-testid="orders-loading">
          {tt('products.loading')}
        </p>
      ) : error ? (
        <p style={{ color: 'crimson' }} data-testid="orders-error">
          {error}
        </p>
      ) : orders.length === 0 ? (
        <p data-testid="orders-empty">{tt('orders.empty')}</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const total = order.items.reduce((acc, item) => {
              const product = products.find((p) => p.id === item.productId);
              return acc + (product?.price ?? 0) * item.qty;
            }, 0);

            return (
              <article key={order.orderId} className="card" style={{ padding: 16, marginBottom: 12 }} data-testid={`order-${order.orderId}`}>
                <h2 data-testid={`order-id-${order.orderId}`}>{order.orderId}</h2>
                <p className="muted">{new Date(order.createdAt).toLocaleString()}</p>
                <ul data-testid={`order-items-${order.orderId}`}>
                  {order.items.map((item) => {
                    const product = products.find((p) => p.id === item.productId);
                    return (
                      <li key={item.productId}>
                        {product?.name ?? `Product #${item.productId}`} x{item.qty}
                      </li>
                    );
                  })}
                </ul>
                <p>
                  <strong>{tt('orders.total')}</strong>{' '}
                  <span data-testid={`order-total-${order.orderId}`}>{formatPrice(total, state.currency)}</span>
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

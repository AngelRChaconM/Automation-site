import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ApiError, apiGetProduct } from '../../api/client';
import { useApp } from '../../context/AppContext';
import type { Product } from '../../data/products';
import { useT } from '../../i18n/useT';
import { formatPrice } from '../../i18n/currency';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { state, addToCart } = useApp();
  const tt = useT();
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const productId = Number(id);
    if (!productId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    if (state.dataMode === 'empty') {
      setProduct(null);
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    apiGetProduct(productId)
      .then((res) => {
        if (!cancelled) setProduct(res.product);
      })
      .catch((err) => {
        if (!cancelled) {
          setProduct(null);
          setNotFound(err instanceof ApiError && err.status === 404);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, state.dataMode]);

  if (loading) {
    return (
      <section data-testid="page-product-loading">
        <p className="muted">{tt('products.loading')}</p>
      </section>
    );
  }

  if (notFound || !product) {
    return (
      <section data-testid="page-product-not-found">
        <h1>Product not found</h1>
        <Link to="/ecommerce/products">Back to products</Link>
      </section>
    );
  }

  return (
    <section data-testid="page-product-detail">
      <div className="two-col">
        <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius: 6 }} />
        <div>
          <h1 data-testid="product-detail-name">{product.name}</h1>
          <p className="muted">
            Category: {product.category} | Brand: {product.brand}
          </p>
          <p className="price" data-testid="product-detail-price" style={{ fontSize: 22 }}>
            {formatPrice(product.price, state.currency)}
          </p>
          <p data-testid="product-detail-description">{product.description}</p>
          <div className="flex-row" style={{ margin: '12px 0' }}>
            <label htmlFor="qty">Quantity:</label>
            <input
              id="qty"
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              data-testid="product-detail-qty"
              style={{ width: 80 }}
            />
            <button
              className="btn"
              onClick={() => void addToCart(product.id, qty)}
              data-testid="product-detail-add"
            >
              {tt('products.add')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

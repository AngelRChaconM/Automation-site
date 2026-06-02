import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, PRODUCTS } from '../../data/products';
import { useT } from '../../i18n/useT';
import { formatPrice } from '../../i18n/currency';

export const Products = () => {
  const { state, addToCart } = useApp();
  const tt = useT();
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const list = state.dataMode === 'empty' ? [] : PRODUCTS;

  /** Products matching search + category (used for brand counts and final list). */
  const catalogForFacets = useMemo(() => {
    return list.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (category && p.category !== category) return false;
      return true;
    });
  }, [list, query, category]);

  const brandsForSidebar = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of catalogForFacets) {
      counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([brandName, count]) => ({ brand: brandName, count }))
      .sort((a, b) => a.brand.localeCompare(b.brand));
  }, [catalogForFacets]);

  const filtered = useMemo(() => {
    if (!brand) return catalogForFacets;
    return catalogForFacets.filter((p) => p.brand === brand);
  }, [catalogForFacets, brand]);

  useEffect(() => {
    if (brand && !catalogForFacets.some((p) => p.brand === brand)) {
      setBrand(null);
    }
  }, [catalogForFacets, brand]);

  return (
    <section data-testid="page-products">
      <h1>{tt('products.title')}</h1>
      <div className="two-col">
        <aside>
          <h3>Category</h3>
          <ul className="sidebar-list" data-testid="category-list">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <button
                  className="btn secondary"
                  style={{ width: '100%', textAlign: 'left' }}
                  onClick={() => setCategory(category === c.id ? null : c.id)}
                  aria-pressed={category === c.id}
                  data-testid={`category-${c.id}`}
                >
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
          <h3>Brands</h3>
          <ul className="sidebar-list" data-testid="brand-list">
            {brandsForSidebar.map((b) => (
              <li key={b.brand}>
                <button
                  className="btn secondary"
                  style={{ width: '100%', textAlign: 'left' }}
                  onClick={() => setBrand(brand === b.brand ? null : b.brand)}
                  aria-pressed={brand === b.brand}
                  data-testid={`brand-${b.brand.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  ({b.count}) {b.brand}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <div>
          <div className="flex-row" style={{ marginBottom: 16 }}>
            <input
              type="search"
              placeholder={tt('products.search')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-testid="products-search"
              style={{ flex: 1 }}
            />
          </div>
          {filtered.length === 0 ? (
            <p className="muted" data-testid="products-empty">{tt('products.empty')}</p>
          ) : (
            <div className="products-grid" data-testid="products-grid">
              {filtered.map((p) => (
                <article key={p.id} className="card product-card" data-testid={`product-card-${p.id}`}>
                  <img src={p.image} alt={p.name} loading="lazy" />
                  <div className="body">
                    <span className="price" data-testid={`product-price-${p.id}`}>
                      {formatPrice(p.price, state.currency)}
                    </span>
                    <strong data-testid={`product-name-${p.id}`}>{p.name}</strong>
                    <span className="muted">{p.brand}</span>
                    <div className="actions">
                      <button
                        className="btn"
                        onClick={() => addToCart(p.id)}
                        data-testid={`product-add-${p.id}`}
                      >
                        {tt('products.add')}
                      </button>
                      <Link
                        to={`/ecommerce/products/${p.id}`}
                        className="btn secondary"
                        data-testid={`product-view-${p.id}`}
                      >
                        {tt('products.view')}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

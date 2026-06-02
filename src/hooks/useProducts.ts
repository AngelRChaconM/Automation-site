import { useEffect, useState } from 'react';
import { apiGetProducts } from '../api/client';
import type { Product } from '../data/products';
import { useApp } from '../context/AppContext';

let catalogCache: Product[] | null = null;
let catalogPromise: Promise<Product[]> | null = null;

export const invalidateProductCatalog = () => {
  catalogCache = null;
  catalogPromise = null;
};

const fetchCatalog = (): Promise<Product[]> => {
  if (catalogCache) return Promise.resolve(catalogCache);
  if (!catalogPromise) {
    catalogPromise = apiGetProducts()
      .then((res) => {
        catalogCache = res.products;
        return catalogCache;
      })
      .catch((err) => {
        catalogPromise = null;
        throw err;
      });
  }
  return catalogPromise;
};

export const useProducts = () => {
  const { state } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(state.dataMode !== 'empty');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.dataMode === 'empty') {
      setProducts([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchCatalog()
      .then((list) => {
        if (!cancelled) setProducts(list);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setProducts([]);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [state.dataMode]);

  return { products, loading, error };
};

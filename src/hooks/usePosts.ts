import { useEffect, useState } from 'react';
import { ApiError, apiGetPosts, type PostSummary } from '../api/client';
import { useApp } from '../context/AppContext';

let postsCache: PostSummary[] | null = null;
let postsPromise: Promise<PostSummary[]> | null = null;

export const invalidatePostsCache = () => {
  postsCache = null;
  postsPromise = null;
};

const fetchPosts = (): Promise<PostSummary[]> => {
  if (postsCache) return Promise.resolve(postsCache);
  if (!postsPromise) {
    postsPromise = apiGetPosts()
      .then((res) => {
        postsCache = res.posts;
        return postsCache;
      })
      .catch((err: unknown) => {
        postsPromise = null;
        throw err;
      });
  }
  return postsPromise;
};

export const usePosts = () => {
  const { state } = useApp();
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(state.dataMode !== 'empty');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.dataMode === 'empty') {
      setPosts([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPosts()
      .then((list) => {
        if (!cancelled) setPosts(list);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setPosts([]);
          setError(err instanceof ApiError ? err.message : err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [state.dataMode]);

  return { posts, loading, error };
};

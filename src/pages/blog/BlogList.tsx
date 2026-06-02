import { Link } from 'react-router-dom';
import { usePosts } from '../../hooks/usePosts';
import { useT } from '../../i18n/useT';

export const BlogList = () => {
  const { posts, loading, error } = usePosts();
  const tt = useT();

  return (
    <section data-testid="page-blog">
      <h1>{tt('blog.title')}</h1>
      {loading ? (
        <p className="muted" data-testid="blog-loading">
          {tt('blog.loading')}
        </p>
      ) : error ? (
        <p style={{ color: 'crimson' }} data-testid="blog-error">
          {error}
        </p>
      ) : posts.length === 0 ? (
        <p data-testid="blog-empty">{tt('blog.empty')}</p>
      ) : (
        <div className="posts-list">
          {posts.map((p) => (
            <article key={p.id} className="card post-card" data-testid={`post-card-${p.id}`}>
              <img src={p.image} alt={p.title} loading="lazy" />
              <div>
                <h2>
                  <Link to={`/blog/${p.id}`} data-testid={`post-link-${p.id}`}>
                    {p.title}
                  </Link>
                </h2>
                <p className="muted">
                  {tt('blog.by')} {p.author} | {p.date}
                </p>
                <p data-testid={`post-excerpt-${p.id}`}>{p.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

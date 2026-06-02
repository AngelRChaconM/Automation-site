import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { POSTS } from '../../data/posts';
import { useT } from '../../i18n/useT';

export const BlogList = () => {
  const { state } = useApp();
  const tt = useT();
  const posts = state.dataMode === 'empty' ? [] : POSTS;

  return (
    <section data-testid="page-blog">
      <h1>{tt('blog.title')}</h1>
      {posts.length === 0 ? (
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

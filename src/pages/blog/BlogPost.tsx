import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Comment } from '../../data/posts';
import { POSTS } from '../../data/posts';
import { useT } from '../../i18n/useT';

export const BlogPost = () => {
  const tt = useT();
  const { id } = useParams<{ id: string }>();
  const original = POSTS.find((p) => p.id === Number(id));
  const [comments, setComments] = useState<Comment[]>(original?.comments ?? []);
  const [newComment, setNewComment] = useState({ author: '', text: '' });

  if (!original) {
    return (
      <section data-testid="page-blog-not-found">
        <h1>{tt('blog.postNotFound')}</h1>
        <Link to="/blog">{tt('blog.back')}</Link>
      </section>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.author || !newComment.text) return;
    setComments([
      ...comments,
      { author: newComment.author, text: newComment.text, date: new Date().toISOString().slice(0, 10) },
    ]);
    setNewComment({ author: '', text: '' });
  };

  return (
    <section data-testid="page-blog-post">
      <img src={original.image} alt={original.title} style={{ width: '100%', borderRadius: 6 }} />
      <h1 data-testid="blog-post-title">{original.title}</h1>
      <p className="muted">
        {tt('blog.by')} {original.author} | {original.date}
      </p>
      <p data-testid="blog-post-body">{original.body}</p>

      <h3>{tt('blog.comments', { count: comments.length })}</h3>
      <ul className="sidebar-list" data-testid="comment-list">
        {comments.map((c, i) => (
          <li key={i} data-testid={`comment-${i}`}>
            <strong>{c.author}</strong> <span className="muted">({c.date})</span>
            <div>{c.text}</div>
          </li>
        ))}
      </ul>

      <form className="form-grid" onSubmit={submit} style={{ marginTop: 16 }}>
        <input
          type="text"
          placeholder={tt('blog.commentAuthor')}
          value={newComment.author}
          onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
          required
          data-testid="comment-author"
        />
        <textarea
          rows={3}
          placeholder={tt('blog.commentPlaceholder')}
          value={newComment.text}
          onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
          required
          data-testid="comment-text"
        />
        <button type="submit" className="btn" data-testid="comment-submit">
          {tt('blog.commentSubmit')}
        </button>
      </form>
    </section>
  );
};

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, apiAddComment, apiGetPost } from '../../api/client';
import type { Comment, Post } from '../../data/posts';
import { useApp } from '../../context/AppContext';
import { useT } from '../../i18n/useT';

export const BlogPost = () => {
  const tt = useT();
  const { id } = useParams<{ id: string }>();
  const { state } = useApp();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [newComment, setNewComment] = useState({ author: '', text: '' });
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    const postId = Number(id);
    if (!postId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    if (state.dataMode === 'empty') {
      setPost(null);
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    apiGetPost(postId)
      .then((res) => {
        if (!cancelled) {
          setPost(res.post);
          setComments(res.post.comments);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setPost(null);
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    setCommentError(null);
    try {
      const res = await apiAddComment(post.id, newComment);
      setComments(res.comments);
      setNewComment({ author: '', text: '' });
    } catch (err) {
      setCommentError(err instanceof ApiError ? err.message : tt('blog.commentError'));
    }
  };

  if (loading) {
    return (
      <section data-testid="page-blog-loading">
        <p className="muted">{tt('blog.loading')}</p>
      </section>
    );
  }

  if (notFound || !post) {
    return (
      <section data-testid="page-blog-not-found">
        <h1>{tt('blog.postNotFound')}</h1>
        <Link to="/blog">{tt('blog.back')}</Link>
      </section>
    );
  }

  return (
    <section data-testid="page-blog-post">
      <img src={post.image} alt={post.title} style={{ width: '100%', borderRadius: 6 }} />
      <h1 data-testid="blog-post-title">{post.title}</h1>
      <p className="muted">
        {tt('blog.by')} {post.author} | {post.date}
      </p>
      <p data-testid="blog-post-body">{post.body}</p>

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
        {commentError && (
          <p style={{ color: 'crimson' }} data-testid="comment-error">
            {commentError}
          </p>
        )}
        <button type="submit" className="btn" data-testid="comment-submit">
          {tt('blog.commentSubmit')}
        </button>
      </form>
    </section>
  );
};

import { Link } from 'react-router-dom';
import { useT } from '../i18n/useT';

export const Home = () => {
  const tt = useT();

  const sections = [
    { to: '/ecommerce/products', label: tt('nav.ecommerce'), testid: 'home-card-ecommerce', desc: tt('home.card.ecommerce') },
    { to: '/blog', label: tt('nav.blog'), testid: 'home-card-blog', desc: tt('home.card.blog') },
    { to: '/handsontable', label: tt('nav.handsontable'), testid: 'home-card-handsontable', desc: tt('home.card.handsontable') },
    { to: '/playground/alerts', label: tt('nav.playground'), testid: 'home-card-playground', desc: tt('home.card.playground') },
  ];

  return (
    <section data-testid="page-home">
      <h1 data-testid="home-title">{tt('home.title')}</h1>
      <p className="muted" data-testid="home-subtitle">{tt('home.subtitle')}</p>
      <div className="products-grid" style={{ marginTop: 24 }}>
        {sections.map((s) => (
          <Link to={s.to} key={s.to} className="card product-card" data-testid={s.testid}>
            <div className="body">
              <strong>{s.label}</strong>
              <span className="muted">{s.desc}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

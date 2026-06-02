import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './layout/Layout';
import { Home } from './pages/Home';
import { Products } from './pages/ecommerce/Products';
import { ProductDetail } from './pages/ecommerce/ProductDetail';
import { Cart } from './pages/ecommerce/Cart';
import { SignupLogin } from './pages/ecommerce/SignupLogin';
import { Checkout } from './pages/ecommerce/Checkout';
import { Contact } from './pages/ecommerce/Contact';
import { BlogList } from './pages/blog/BlogList';
import { BlogPost } from './pages/blog/BlogPost';
import { HandsOnTablePage } from './pages/handsontable/HandsOnTablePage';
import { Alerts } from './pages/playground/Alerts';
import { Iframes } from './pages/playground/Iframes';
import { ShadowDom } from './pages/playground/ShadowDom';
import { Flaky } from './pages/playground/Flaky';
import { Files } from './pages/playground/Files';

export const App = () => (
  <AppProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          <Route path="/ecommerce" element={<Navigate to="/ecommerce/products" replace />} />
          <Route path="/ecommerce/products" element={<Products />} />
          <Route path="/ecommerce/products/:id" element={<ProductDetail />} />
          <Route path="/ecommerce/cart" element={<Cart />} />
          <Route path="/ecommerce/login" element={<SignupLogin />} />
          <Route path="/ecommerce/checkout" element={<Checkout />} />
          <Route path="/ecommerce/contact" element={<Contact />} />

          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogPost />} />

          <Route path="/handsontable" element={<HandsOnTablePage />} />

          <Route path="/playground" element={<Navigate to="/playground/alerts" replace />} />
          <Route path="/playground/alerts" element={<Alerts />} />
          <Route path="/playground/iframes" element={<Iframes />} />
          <Route path="/playground/shadow-dom" element={<ShadowDom />} />
          <Route path="/playground/flaky" element={<Flaky />} />
          <Route path="/playground/files" element={<Files />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AppProvider>
);

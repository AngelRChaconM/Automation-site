import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useT } from '../../i18n/useT';

export const SignupLogin = () => {
  const { state, setAuth } = useApp();
  const tt = useT();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/ecommerce/products';

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupOk, setSignupOk] = useState(false);

  const isLoggedIn = state.auth !== 'anon';

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.includes('@') || loginPass.length < 4) {
      setLoginError(tt('login.errorInvalid'));
      return;
    }
    setLoginError(null);
    setAuth(loginEmail.includes('admin') ? 'admin' : 'user', loginEmail);
    navigate(redirectTo);
  };

  const submitSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupName && signupEmail.includes('@')) {
      setSignupOk(true);
      setAuth('user', signupEmail);
      navigate(redirectTo);
    }
  };

  const logout = () => {
    setAuth('anon');
    setLoginEmail('');
    setLoginPass('');
    setSignupOk(false);
  };

  return (
    <section data-testid="page-signup-login">
      <div className="two-col">
        <div className="card" style={{ padding: 16 }}>
          <h2 data-testid="login-title">{tt('login.title')}</h2>
          {isLoggedIn ? (
            <>
              <p data-testid="logged-as">
                {tt('login.loggedAs', { email: state.userEmail ?? '', role: state.auth })}
              </p>
              <button type="button" className="btn secondary" onClick={logout} data-testid="login-logout">
                {tt('login.logout')}
              </button>
            </>
          ) : (
            <form className="form-grid" onSubmit={submitLogin}>
              <input
                type="email"
                placeholder={tt('login.email')}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                data-testid="login-email"
                required
              />
              <input
                type="password"
                placeholder={tt('login.password')}
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                data-testid="login-password"
                required
              />
              {loginError && (
                <p style={{ color: 'crimson' }} data-testid="login-error">
                  {loginError}
                </p>
              )}
              <button type="submit" className="btn" data-testid="login-submit">
                {tt('login.submit')}
              </button>
            </form>
          )}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h2 data-testid="signup-title">{tt('signup.title')}</h2>
          {isLoggedIn ? (
            <p className="muted">{tt('login.loggedAs', { email: state.userEmail ?? '', role: state.auth })}</p>
          ) : signupOk ? (
            <p data-testid="signup-success">{tt('login.signupSuccess')}</p>
          ) : (
            <form className="form-grid" onSubmit={submitSignup}>
              <input
                type="text"
                placeholder={tt('signup.name')}
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                data-testid="signup-name"
                required
              />
              <input
                type="email"
                placeholder={tt('login.email')}
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                data-testid="signup-email"
                required
              />
              <button type="submit" className="btn" data-testid="signup-submit">
                {tt('signup.submit')}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

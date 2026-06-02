import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { useT } from '../../i18n/useT';

export const SignupLogin = () => {
  const { state, login, signup, setAuth } = useApp();
  const tt = useT();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/ecommerce/products';

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupOk, setSignupOk] = useState(false);

  const isLoggedIn = state.auth !== 'anon';

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await login(loginEmail, loginPass);
      navigate(redirectTo);
    } catch (err) {
      setLoginError(err instanceof ApiError ? err.message : tt('login.errorInvalid'));
    }
  };

  const submitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    try {
      await signup(signupName, signupEmail, signupPass);
      setSignupOk(true);
      navigate(redirectTo);
    } catch (err) {
      setSignupError(err instanceof ApiError ? err.message : tt('login.errorInvalid'));
    }
  };

  const logout = async () => {
    await setAuth('anon');
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
              <input
                type="password"
                placeholder={tt('signup.password')}
                value={signupPass}
                onChange={(e) => setSignupPass(e.target.value)}
                data-testid="signup-password"
                required
              />
              {signupError && (
                <p style={{ color: 'crimson' }} data-testid="signup-error">
                  {signupError}
                </p>
              )}
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

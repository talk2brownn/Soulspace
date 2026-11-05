import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import './Auth.css';

function Auth() {
  const { continueAsGuest } = useAuth();
  const [tab, setTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      if (tab === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (err) throw err;
        if (!data.session) {
          setMessage('Check your email to confirm your account, then come back and sign in.');
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    setError('');
    setMessage('');
    if (!email) {
      setError('Enter your email first, then tap "Forgot password".');
      return;
    }
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (err) setError(err.message);
    else setMessage('If that email has an account, a reset link is on its way.');
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-logo">🌌</div>
        <h1>Welcome to SoulSpace</h1>
        <p className="auth-sub">
          A private space to check in, reflect and grow. Sign in to keep your entries safe and
          available on any device.
        </p>

        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'signin'}
            className={tab === 'signin' ? 'active' : ''}
            onClick={() => setTab('signin')}
          >
            Sign in
          </button>
          <button
            role="tab"
            aria-selected={tab === 'signup'}
            className={tab === 'signup' ? 'active' : ''}
            onClick={() => setTab('signup')}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-message">{message}</p>}
          <button type="submit" className="auth-submit" disabled={busy}>
            {busy ? 'Please wait…' : tab === 'signup' ? 'Create account' : 'Sign in'}
          </button>
          {tab === 'signin' && (
            <button type="button" className="auth-link" onClick={handleReset}>
              Forgot password?
            </button>
          )}
        </form>

        <div className="auth-divider"><span>or</span></div>
        <button className="auth-guest" onClick={continueAsGuest}>
          Continue without an account
        </button>
        <p className="auth-fine">
          Without an account, entries stay only in this browser. If you sign up later, they'll be
          copied into your account.
        </p>
      </div>
    </div>
  );
}

export default Auth;

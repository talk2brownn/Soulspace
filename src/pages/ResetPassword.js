import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import './Auth.css';

// Shown after someone opens the "reset password" link from their email.
function ResetPassword() {
  const { finishRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) setError(err.message);
    else finishRecovery();
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-logo">🔑</div>
        <h1>Choose a new password</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            New password
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button type="submit" className="auth-submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;

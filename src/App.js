import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Journal from './pages/Journal';
import Habits from './pages/Habits';
import Stories from './pages/Stories';
import Chat from './pages/Chat';
import Garden from './pages/Garden';
import Report from './pages/Report';
import Support from './pages/Support';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider, useAuth } from './lib/auth';

function AppShell() {
  const { mode, recovering, syncError } = useAuth();

  if (mode === 'loading') {
    return <div className="app-loading" aria-live="polite">Opening your space…</div>;
  }
  if (recovering) return <ResetPassword />;

  return (
    <div className="app">
      <Navbar />
      {syncError && <div className="sync-banner" role="status">{syncError}</div>}
      <div className="main-content">
        <Routes>
          {/* The support page is always reachable, signed in or not. */}
          <Route path="/support" element={<Support />} />
          {mode === 'signedOut' ? (
            <Route path="*" element={<Auth />} />
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/garden" element={<Garden />} />
              <Route path="/report" element={<Report />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

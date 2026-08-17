import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Journal from './pages/Journal';
import Habits from './pages/Habits';
import Stories from './pages/Stories';
import Chat from './pages/Chat';
import Garden from './pages/Garden';
import Report from './pages/Report';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/garden" element={<Garden />} />
            <Route path="/report" element={<Report />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
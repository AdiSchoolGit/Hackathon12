import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import FoundCardPage from './pages/FoundCardPage';
import LostCardStatusPage from './pages/LostCardStatusPage';
import AdminPage from './pages/AdminPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<FoundCardPage />} />
          <Route path="/found" element={<FoundCardPage />} />
          <Route path="/status" element={<LostCardStatusPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

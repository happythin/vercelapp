import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MarkaRaporu from './pages/MarkaRaporu';
import KategoriRaporu from './pages/KategoriRaporu';
import UrunRaporu from './pages/UrunRaporu';
import MusteriRaporu from './pages/MusteriRaporu';
import KanalRaporu from './pages/KanalRaporu';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marka" element={<MarkaRaporu />} />
        <Route path="/kategori" element={<KategoriRaporu />} />
        <Route path="/urun" element={<UrunRaporu />} />
        <Route path="/musteri" element={<MusteriRaporu />} />
        <Route path="/kanal" element={<KanalRaporu />} />
      </Routes>
    </Router>
  );
}

export default App;

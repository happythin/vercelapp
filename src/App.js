import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StokRaporu from './pages/StokRaporu';
import SKTRaporu from './pages/SKTRaporu';
import SatisRaporu from './pages/SatisRaporu';
import AlisRaporu from './pages/AlisRaporu';
import MarkaRaporu from './pages/MarkaRaporu';
import KategoriRaporu from './pages/KategoriRaporu';
import UrunRaporu from './pages/UrunRaporu';
import MusteriRaporu from './pages/MusteriRaporu';
import KanalRaporu from './pages/KanalRaporu';
import MarkaAlis from './pages/MarkaAlis';
import KategoriAlis from './pages/KategoriAlis';
import UrunAlis from './pages/UrunAlis';
import KanalAlis from './pages/KanalAlis';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stok" element={<StokRaporu />} />
        <Route path="/stok/skt" element={<SKTRaporu />} />
        <Route path="/satis" element={<SatisRaporu />} />
        <Route path="/satis/marka" element={<MarkaRaporu />} />
        <Route path="/satis/kategori" element={<KategoriRaporu />} />
        <Route path="/satis/urun" element={<UrunRaporu />} />
        <Route path="/satis/musteri" element={<MusteriRaporu />} />
        <Route path="/satis/kanal" element={<KanalRaporu />} />
        <Route path="/alis" element={<AlisRaporu />} />
        <Route path="/alis/marka" element={<MarkaAlis />} />
        <Route path="/alis/kategori" element={<KategoriAlis />} />
        <Route path="/alis/urun" element={<UrunAlis />} />
        <Route path="/alis/kanal" element={<KanalAlis />} />
      </Routes>
    </Router>
  );
}

export default App;

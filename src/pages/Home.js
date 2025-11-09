import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">Raporla</h1>
          <nav className="nav">
            <Link to="/" className="nav-link active">Ana Sayfa</Link>
            <Link to="/marka" className="nav-link">Marka Bazlı</Link>
            <Link to="/kategori" className="nav-link">Kategori Bazlı</Link>
            <Link to="/urun" className="nav-link">Ürün Bazlı</Link>
            <Link to="/musteri" className="nav-link">Müşteri Bazlı</Link>
            <Link to="/kanal" className="nav-link">Satış Kanalı</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h2>Satış Raporlarınızı Görüntüleyin</h2>
          <p>Marka, kategori, ürün, müşteri ve satış kanalı bazlı detaylı raporlar</p>
        </div>
      </section>

      <section className="raporlar-grid">
        <div className="rapor-card">
          <div className="rapor-icon">🏷️</div>
          <h3>Marka Bazlı Raporlar</h3>
          <p>Markalarınızın satış performansını görüntüleyin</p>
          <Link to="/marka" className="rapor-button">İncele →</Link>
        </div>

        <div className="rapor-card">
          <div className="rapor-icon">📦</div>
          <h3>Kategori Bazlı Raporlar</h3>
          <p>Kategorilerinizin satış dağılımını analiz edin</p>
          <Link to="/kategori" className="rapor-button">İncele →</Link>
        </div>

        <div className="rapor-card">
          <div className="rapor-icon">🛍️</div>
          <h3>Ürün Bazlı Raporlar</h3>
          <p>Ürünlerinizin detaylı satış istatistiklerini görün</p>
          <Link to="/urun" className="rapor-button">İncele →</Link>
        </div>

        <div className="rapor-card">
          <div className="rapor-icon">👥</div>
          <h3>Müşteri Bazlı Raporlar</h3>
          <p>Müşterilerinizin alışkanlıklarını inceleyin</p>
          <Link to="/musteri" className="rapor-button">İncele →</Link>
        </div>

        <div className="rapor-card">
          <div className="rapor-icon">🏪</div>
          <h3>Satış Kanalı Raporları</h3>
          <p>Pazaryerleri ve mağazaların satış performansını analiz edin</p>
          <Link to="/kanal" className="rapor-button">İncele →</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

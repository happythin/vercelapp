import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchSalesData, groupByProduct } from '../services/sheetsService';
import './Home.css';

const Home = () => {
  const [monthlyStockData, setMonthlyStockData] = useState([]);
  const [loadingStock, setLoadingStock] = useState(true);

  useEffect(() => {
    loadMonthlyStockData();
  }, []);

  const loadMonthlyStockData = async () => {
    setLoadingStock(true);
    try {
      const salesData = await fetchSalesData();
      const grouped = groupByProduct(salesData);
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthName = months[lastMonth];

      const monthlyData = Object.entries(grouped).map(([urun, degerler]) => {
        const aylikVeriler = degerler.aylikVeriler || {};
        const lastMonthTotal = aylikVeriler[lastMonthName] || 0;
        
        return {
          name: urun.length > 15 ? urun.substring(0, 15) + '...' : urun,
          fullName: urun,
          toplamAdet: lastMonthTotal
        };
      });

      const sortedData = monthlyData
        .filter(item => item.toplamAdet > 0)
        .sort((a, b) => b.toplamAdet - a.toplamAdet)
        .slice(0, 5);

      setMonthlyStockData(sortedData);
    } catch (error) {
      console.error('Stok verisi yüklenirken hata:', error);
    } finally {
      setLoadingStock(false);
    }
  };

  const chartData = monthlyStockData.map(item => ({
    name: item.name,
    value: item.toplamAdet
  }));

  return (
    <div className="home-container">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">Raporla</h1>
          <nav className="nav">
            <Link to="/" className="nav-link active">Ana Sayfa</Link>
          </nav>
        </div>
      </header>

      <section className="ana-kategoriler">
        <div className="ana-kategori-card stok-preview-card">
          <div className="ana-kategori-icon">📊</div>
          <h2>Stok Raporu</h2>

          {loadingStock ? (
            <div className="stok-preview-loading">Yükleniyor...</div>
          ) : monthlyStockData.length > 0 ? (
            <div className="stok-preview-content">
              <div className="stok-preview-title">Son 1 Ay - En Çok Satan Ürünler</div>
              <div className="stok-preview-chart">
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 10 }} width={40} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="stok-preview-list">
                {monthlyStockData.slice(0, 3).map((item, index) => (
                  <div key={item.fullName} className="stok-preview-item">
                    <span className="stok-preview-rank">#{index + 1}</span>
                    <span className="stok-preview-name">{item.name}</span>
                    <span className="stok-preview-count">{item.toplamAdet.toLocaleString('tr-TR')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="stok-preview-empty">Bu ay için veri bulunmamaktadır.</div>
          )}

          <div className="stok-buttons-container">
            <Link to="/stok" className="ana-kategori-button">Stok Raporuna Git →</Link>
            <Link to="/stok/skt" className="ana-kategori-button stok-skt-button">SKT Raporuna Git →</Link>
          </div>
        </div>

        <div className="ana-kategori-card">
          <div className="ana-kategori-icon">💰</div>
          <h2>Satış Raporları</h2>
          <div className="alt-kategoriler">
            <Link to="/satis/marka" className="alt-kategori-link">🏷️ Marka Bazlı</Link>
            <Link to="/satis/kategori" className="alt-kategori-link">📦 Kategori Bazlı</Link>
            <Link to="/satis/urun" className="alt-kategori-link">🛍️ Ürün Bazlı</Link>
            <Link to="/satis/musteri" className="alt-kategori-link">👥 Müşteri Bazlı</Link>
            <Link to="/satis/kanal" className="alt-kategori-link">🏪 Satış Kanalı</Link>
          </div>
        </div>

        <div className="ana-kategori-card">
          <div className="ana-kategori-icon">🛒</div>
          <h2>Alış Raporları</h2>
          <div className="alt-kategoriler">
            <Link to="/alis/marka" className="alt-kategori-link">🏷️ Marka Bazlı</Link>
            <Link to="/alis/kategori" className="alt-kategori-link">📦 Kategori Bazlı</Link>
            <Link to="/alis/urun" className="alt-kategori-link">🛍️ Ürün Bazlı</Link>
            <Link to="/alis/musteri" className="alt-kategori-link">👥 Müşteri Bazlı</Link>
            <Link to="/alis/kanal" className="alt-kategori-link">🏪 Satış Kanalı</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

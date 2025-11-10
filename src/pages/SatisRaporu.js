import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Header from '../components/Header';
import { fetchSalesData, groupByBrand, groupByCategory, groupByProduct, groupByCustomer, groupByChannel } from '../services/sheetsService';
import './Dashboard.css';

const SatisRaporu = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState({
    marka: null,
    kategori: null,
    urun: null,
    musteri: null,
    kanal: null
  });

  const loadPreviewData = useCallback(async () => {
    setLoading(true);
    try {
      const salesData = await fetchSalesData();
      
      const markaData = groupByBrand(salesData);
      const kategoriData = groupByCategory(salesData);
      const urunData = groupByProduct(salesData);
      const musteriData = groupByCustomer(salesData);
      const kanalData = groupByChannel(salesData);

      setPreviewData({
        marka: preparePreviewData(markaData, 'Marka'),
        kategori: preparePreviewData(kategoriData, 'Kategori'),
        urun: preparePreviewData(urunData, 'Ürün'),
        musteri: preparePreviewData(musteriData, 'Müşteri'),
        kanal: preparePreviewData(kanalData, 'Kanal')
      });
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreviewData();
  }, [loadPreviewData]);

  const preparePreviewData = (groupedData, type) => {
    const sorted = Object.entries(groupedData)
      .map(([name, values]) => ({
        name,
        toplamAdet: values.toplamAdet || 0,
        aylikVeriler: values.aylikVeriler || {}
      }))
      .sort((a, b) => b.toplamAdet - a.toplamAdet)
      .slice(0, 5); // İlk 5 öğe

    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const monthlyData = months.map(month => {
      const total = sorted.reduce((sum, item) => sum + (item.aylikVeriler[month] || 0), 0);
      return { ay: month, adet: total };
    });

    return {
      chartData: sorted,
      monthlyData,
      total: Object.values(groupedData).reduce((sum, item) => sum + (item.toplamAdet || 0), 0)
    };
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#8b5cf6', '#ec4899'];

  const reportCards = [
    {
      id: 'marka',
      title: 'Marka Bazlı Satış',
      path: '/satis/marka',
      icon: '🏷️',
      data: previewData.marka
    },
    {
      id: 'kategori',
      title: 'Kategori Bazlı Satış',
      path: '/satis/kategori',
      icon: '📦',
      data: previewData.kategori
    },
    {
      id: 'urun',
      title: 'En Çok Satan Ürünler',
      path: '/satis/urun',
      icon: '⭐',
      data: previewData.urun
    },
    {
      id: 'musteri',
      title: 'Müşteri Bazlı Satış',
      path: '/satis/musteri',
      icon: '👥',
      data: previewData.musteri
    },
    {
      id: 'kanal',
      title: 'Satış Kanalı Bazlı',
      path: '/satis/kanal',
      icon: '🛒',
      data: previewData.kanal
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <Header pageTitle="SATIŞ RAPORU" breadcrumb="Anasayfa > Satış >" />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', color: '#e0e0e0', padding: '2rem' }}>Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Header pageTitle="SATIŞ RAPORU" breadcrumb="Anasayfa > Satış >" />
      
      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2 className="section-title">Satış Raporları</h2>
          <p className="section-subtitle" style={{ color: '#b0b0b0', marginBottom: '2rem' }}>
            Aşağıdaki raporlardan birini seçerek detaylı bilgilere ulaşabilirsiniz.
          </p>

          <div className="preview-grid">
            {reportCards.map((card) => (
              <div 
                key={card.id} 
                className="preview-card"
                onClick={() => navigate(card.path)}
                style={{ cursor: 'pointer' }}
              >
                <div className="preview-card-header">
                  <span className="preview-icon">{card.icon}</span>
                  <h3 className="preview-title">{card.title}</h3>
                </div>

                {card.data && (
                  <>
                    <div className="preview-stats">
                      <div className="preview-stat">
                        <span className="stat-label">Toplam Adet</span>
                        <span className="stat-value">{card.data.total.toLocaleString('tr-TR')}</span>
                      </div>
                    </div>

                    <div className="preview-chart">
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={card.data.chartData.slice(0, 5)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} fontSize={10} />
                          <Tooltip />
                          <Bar dataKey="toplamAdet" fill={COLORS[0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="preview-chart">
                      <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={card.data.monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="ay" fontSize={10} />
                          <YAxis fontSize={10} />
                          <Tooltip />
                          <Line type="monotone" dataKey="adet" stroke={COLORS[1]} strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}

                <div className="preview-footer">
                  <span className="preview-link">Detayları Görüntüle →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatisRaporu;


import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '../components/Header';
import { fetchSalesData, groupByProduct } from '../services/sheetsService';
import './Home.css';

const Home = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [criticalSKTData, setCriticalSKTData] = useState({
    gecmis: [],
    ucAy: []
  });
  const [expandedCategories, setExpandedCategories] = useState({
    stok: true,
    satis: false,
    alis: false
  });

  const parseDate = useCallback((dateString) => {
    if (!dateString || dateString.trim() === '') return null;
    
    const cleaned = dateString.trim();
    let date = null;
    
    const formats = [
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      /^(\d{1,2})\.(\d{1,2})\.(\d{2})$/,
      /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/
    ];
    
    for (const format of formats) {
      const match = cleaned.match(format);
      if (match) {
        if (format === formats[0] || format === formats[1]) {
          const day = parseInt(match[1], 10);
          const month = parseInt(match[2], 10) - 1;
          const year = parseInt(match[3], 10);
          date = new Date(year, month, day);
        } else if (format === formats[2]) {
          const year = parseInt(match[1], 10);
          const month = parseInt(match[2], 10) - 1;
          const day = parseInt(match[3], 10);
          date = new Date(year, month, day);
        } else if (format === formats[3] || format === formats[4]) {
          const day = parseInt(match[1], 10);
          const month = parseInt(match[2], 10) - 1;
          const year = 2000 + parseInt(match[3], 10);
          date = new Date(year, month, day);
        }
        break;
      }
    }
    
    if (!date || isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  }, []);

  const calculateCriticalSKTData = useCallback((grouped) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const threeMonthsLater = new Date(now);
    threeMonthsLater.setMonth(now.getMonth() + 3);
    
    const gecmis = [];
    const ucAy = [];
    
    Object.entries(grouped).forEach(([urun, degerler]) => {
      const sktString = degerler.skt;
      if (!sktString) return;
      
      const sktDate = parseDate(sktString);
      if (!sktDate) return;
      
      sktDate.setHours(0, 0, 0, 0);
      
      const toplamAdet = degerler.toplamAdet || 0;
      if (toplamAdet === 0) return;
      
      const productInfo = {
        name: urun.length > 20 ? urun.substring(0, 20) + '...' : urun,
        fullName: urun,
        skt: sktString,
        toplamAdet: toplamAdet
      };
      
      if (sktDate < now) {
        gecmis.push(productInfo);
      } else if (sktDate >= now && sktDate <= threeMonthsLater) {
        ucAy.push(productInfo);
      }
    });
    
    gecmis.sort((a, b) => b.toplamAdet - a.toplamAdet);
    ucAy.sort((a, b) => b.toplamAdet - a.toplamAdet);
    
    setCriticalSKTData({
      gecmis: gecmis.slice(0, 10),
      ucAy: ucAy.slice(0, 10)
    });
  }, [parseDate]);

  const loadTopProductsData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSalesData();
      const grouped = groupByProduct(data);
      
      const productsArray = Object.entries(grouped)
        .map(([name, values]) => ({
          name: name,
          toplamAdet: values.toplamAdet || 0,
          aylikVeriler: values.aylikVeriler || {}
        }))
        .sort((a, b) => b.toplamAdet - a.toplamAdet)
        .slice(0, 10);
      
      calculateChartData(productsArray, data);
      calculateCriticalSKTData(grouped);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateCriticalSKTData]);

  useEffect(() => {
    loadTopProductsData();
  }, [loadTopProductsData]);

  const calculateChartData = (products, allData) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const daysPassed = now.getDate();
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const currentMonthName = months[currentMonth];
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthName = months[lastMonth];

    const dailyData = products.map(product => {
      const monthlyTotal = product.aylikVeriler[currentMonthName] || 0;
      const dailyEstimate = daysPassed > 0 ? Math.round((monthlyTotal / daysPassed) * 1) : 0;
      return {
        name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
        fullName: product.name,
        adet: dailyEstimate
      };
    });

    const weeklyData = products.map(product => {
      const monthlyTotal = product.aylikVeriler[currentMonthName] || 0;
      const weekDays = Math.min(7, daysPassed);
      const weeklyEstimate = weekDays > 0 ? Math.round((monthlyTotal / daysPassed) * 7) : 0;
      return {
        name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
        fullName: product.name,
        adet: weeklyEstimate
      };
    });

    const monthlyData = products.map(product => {
      const monthlyTotal = product.aylikVeriler[lastMonthName] || 0;
      return {
        name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
        fullName: product.name,
        adet: monthlyTotal
      };
    });

    setChartData({
      daily: dailyData,
      weekly: weeklyData,
      monthly: monthlyData
    });
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const sitemapData = [
    {
      id: 'stok',
      title: 'STOK RAPORU',
      icon: '📊',
      items: [
        { path: '/stok', label: 'Güncel Stok Durumu' },
        { path: '/stok/skt', label: 'SKT' }
      ]
    },
    {
      id: 'satis',
      title: 'SATIŞ RAPORU',
      icon: '💰',
      items: [
        { path: '/satis/marka', label: 'Marka' },
        { path: '/satis/kategori', label: 'Kategori' },
        { path: '/satis/urun', label: 'En Çok Satan' },
        { path: '/satis/musteri', label: 'Müşteri' },
        { path: '/satis/kanal', label: 'Satış Kanalı' }
      ]
    },
    {
      id: 'alis',
      title: 'ALIŞ RAPORU',
      icon: '🛒',
      items: [
        { path: '/alis/marka', label: 'Marka' },
        { path: '/alis/kategori', label: 'Kategori' },
        { path: '/alis/urun', label: 'En Çok Alınan' },
        { path: '/alis/kanal', label: 'Tedarikçi' }
      ]
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="home-container">
      <Header />
      
      <div className="home-layout">
        <aside className="sitemap-sidebar">
          <nav className="sitemap-nav">
            {sitemapData.map((category) => (
              <div key={category.id} className="sitemap-category">
                <button
                  className={`sitemap-category-header ${expandedCategories[category.id] ? 'expanded' : ''}`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-title">{category.title}</span>
                  <span className="category-arrow">
                    {expandedCategories[category.id] ? '▼' : '▶'}
                  </span>
                </button>
                
                {expandedCategories[category.id] && (
                  <ul className="sitemap-items">
                    {category.items.map((item) => (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`sitemap-item ${isActive(item.path) ? 'active' : ''}`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <main className="home-content">
          <div className="top-products-section">
            <h2 className="section-title">EN ÇOK SATAN ÜRÜNLER</h2>
            
            {loading ? (
              <div className="loading-message">Yükleniyor...</div>
            ) : (
              <div className="charts-container">
                <div className="chart-card">
                  <h3 className="chart-title">Günlük Satış (Tahmini)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData.daily} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} fontSize={11} />
                      <Tooltip 
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                        formatter={(value) => [`${value.toLocaleString('tr-TR')} adet`, 'Satış']}
                      />
                      <Bar dataKey="adet" fill="#667eea" name="Satış Adeti" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3 className="chart-title">Haftalık Satış (Tahmini)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData.weekly} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} fontSize={11} />
                      <Tooltip 
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                        formatter={(value) => [`${value.toLocaleString('tr-TR')} adet`, 'Satış']}
                      />
                      <Bar dataKey="adet" fill="#764ba2" name="Satış Adeti" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3 className="chart-title">Aylık Satış (Geçen Ay)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData.monthly} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} fontSize={11} />
                      <Tooltip 
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                        formatter={(value) => [`${value.toLocaleString('tr-TR')} adet`, 'Satış']}
                      />
                      <Bar dataKey="adet" fill="#f093fb" name="Satış Adeti" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          <div className="top-products-section" style={{ marginTop: '3rem' }}>
            <h2 className="section-title">KRİTİK SKT DÜZEYİNDE ÜRÜNLER</h2>
            
            {loading ? (
              <div className="loading-message">Yükleniyor...</div>
            ) : (
              <div className="charts-container">
                <div className="chart-card">
                  <h3 className="chart-title">SKT Geçmiş Ürünler</h3>
                  {criticalSKTData.gecmis.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={criticalSKTData.gecmis} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} fontSize={11} />
                        <Tooltip 
                          labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                          formatter={(value, name, props) => [
                            `${value.toLocaleString('tr-TR')} adet`,
                            `SKT: ${props.payload.skt}`
                          ]}
                        />
                        <Bar dataKey="toplamAdet" fill="#ef4444" name="Stok Adeti" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#b0b0b0', padding: '2rem' }}>
                      SKT geçmiş ürün bulunmamaktadır.
                    </div>
                  )}
                </div>

                <div className="chart-card">
                  <h3 className="chart-title">3 Ay Kalmış Ürünler</h3>
                  {criticalSKTData.ucAy.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={criticalSKTData.ucAy} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} fontSize={11} />
                        <Tooltip 
                          labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                          formatter={(value, name, props) => [
                            `${value.toLocaleString('tr-TR')} adet`,
                            `SKT: ${props.payload.skt}`
                          ]}
                        />
                        <Bar dataKey="toplamAdet" fill="#f59e0b" name="Stok Adeti" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#b0b0b0', padding: '2rem' }}>
                      3 ay kalmış ürün bulunmamaktadır.
                    </div>
                  )}
                </div>

                <div className="chart-card">
                  <h3 className="chart-title">Özet İstatistik</h3>
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      padding: '1rem', 
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}>
                      <div style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        SKT Geçmiş
                      </div>
                      <div style={{ color: '#e0e0e0', fontSize: '1.5rem', fontWeight: '700' }}>
                        {criticalSKTData.gecmis.length} Ürün
                      </div>
                      <div style={{ color: '#b0b0b0', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        Toplam: {criticalSKTData.gecmis.reduce((sum, item) => sum + item.toplamAdet, 0).toLocaleString('tr-TR')} adet
                      </div>
                    </div>
                    <div style={{ 
                      background: 'rgba(245, 158, 11, 0.1)', 
                      padding: '1rem', 
                      borderRadius: '8px',
                      border: '1px solid rgba(245, 158, 11, 0.3)'
                    }}>
                      <div style={{ color: '#f59e0b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        3 Ay Kalmış
                      </div>
                      <div style={{ color: '#e0e0e0', fontSize: '1.5rem', fontWeight: '700' }}>
                        {criticalSKTData.ucAy.length} Ürün
                      </div>
                      <div style={{ color: '#b0b0b0', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        Toplam: {criticalSKTData.ucAy.reduce((sum, item) => sum + item.toplamAdet, 0).toLocaleString('tr-TR')} adet
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;

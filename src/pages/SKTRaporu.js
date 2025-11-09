import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { fetchSalesData, groupByProduct } from '../services/sheetsService';
import './RaporSayfasi.css';

const SKTRaporu = () => {
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState({});
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [sktCategories, setSktCategories] = useState({
    gecmis: [],
    ucAy: [],
    altiAy: [],
    onIkiAy: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const salesData = await fetchSalesData();
      const grouped = groupByProduct(salesData);
      setGroupedData(grouped);
      categorizeBySKT(grouped);
    } finally {
      setLoading(false);
    }
  };

  const parseDate = (dateString) => {
    if (!dateString || dateString.trim() === '') return null;
    
    const cleaned = dateString.trim();
    let date = null;
    
    const formats = [
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,  // DD.MM.YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,  // DD/MM/YYYY
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,     // YYYY-MM-DD
      /^(\d{1,2})\.(\d{1,2})\.(\d{2})$/,   // DD.MM.YY
      /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/    // DD/MM/YY
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
  };

  const categorizeBySKT = (grouped) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const threeMonthsLater = new Date(now);
    threeMonthsLater.setMonth(now.getMonth() + 3);
    
    const sixMonthsLater = new Date(now);
    sixMonthsLater.setMonth(now.getMonth() + 6);
    
    const twelveMonthsLater = new Date(now);
    twelveMonthsLater.setMonth(now.getMonth() + 12);
    
    const categories = {
      gecmis: [],
      ucAy: [],
      altiAy: [],
      onIkiAy: []
    };
    
    Object.entries(grouped).forEach(([urun, degerler]) => {
      const sktString = degerler.skt;
      if (!sktString) return;
      
      const sktDate = parseDate(sktString);
      if (!sktDate) return;
      
      sktDate.setHours(0, 0, 0, 0);
      
      const toplamAdet = degerler.toplamAdet || 0;
      if (toplamAdet === 0) return;
      
      const productInfo = {
        name: urun,
        skt: sktString,
        sktDate: sktDate,
        toplamAdet: toplamAdet
      };
      
      if (sktDate < now) {
        categories.gecmis.push(productInfo);
      } else if (sktDate > now && sktDate <= threeMonthsLater) {
        categories.ucAy.push(productInfo);
      } else if (sktDate > threeMonthsLater && sktDate <= sixMonthsLater) {
        categories.altiAy.push(productInfo);
      } else if (sktDate > sixMonthsLater) {
        categories.onIkiAy.push(productInfo);
      }
    });
    
    setSktCategories(categories);
  };

  const getCategoryStats = (category) => {
    const totalAdet = category.reduce((sum, item) => sum + item.toplamAdet, 0);
    const totalStock = Object.values(groupedData).reduce((sum, item) => sum + (item.toplamAdet || 0), 0);
    const percentage = totalStock > 0 ? ((totalAdet / totalStock) * 100).toFixed(2) : 0;
    
    return {
      totalAdet,
      totalStock,
      percentage: parseFloat(percentage),
      productCount: category.length
    };
  };

  const getChartData = () => {
    const stats = {
      gecmis: getCategoryStats(sktCategories.gecmis),
      ucAy: getCategoryStats(sktCategories.ucAy),
      altiAy: getCategoryStats(sktCategories.altiAy),
      onIkiAy: getCategoryStats(sktCategories.onIkiAy)
    };
    
    return [
      { name: 'SKT Geçmiş', value: stats.gecmis.totalAdet, percentage: stats.gecmis.percentage, color: '#ef4444' },
      { name: 'SKT 3 Ay Kaldı', value: stats.ucAy.totalAdet, percentage: stats.ucAy.percentage, color: '#f59e0b' },
      { name: 'SKT 6 Ay Kaldı', value: stats.altiAy.totalAdet, percentage: stats.altiAy.percentage, color: '#3b82f6' },
      { name: 'SKT 12+ Ay Kaldı', value: stats.onIkiAy.totalAdet, percentage: stats.onIkiAy.percentage, color: '#10b981' }
    ].filter(item => item.value > 0);
  };

  if (loading) {
    return (
      <div className="rapor-container">
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  const chartData = getChartData();
  const totalStock = Object.values(groupedData).reduce((sum, item) => sum + (item.toplamAdet || 0), 0);

  const categories = [
    {
      key: 'gecmis',
      title: 'SKT Geçmiş Ürünler',
      icon: '🔴',
      data: sktCategories.gecmis,
      color: '#ef4444'
    },
    {
      key: 'ucAy',
      title: 'SKT 3 Ay Kaldı',
      icon: '🟠',
      data: sktCategories.ucAy,
      color: '#f59e0b'
    },
    {
      key: 'altiAy',
      title: 'SKT 6 Ay Kaldı',
      icon: '🔵',
      data: sktCategories.altiAy,
      color: '#3b82f6'
    },
    {
      key: 'onIkiAy',
      title: 'SKT 12+ Ay Kaldı',
      icon: '🟢',
      data: sktCategories.onIkiAy,
      color: '#10b981'
    }
  ];

  return (
    <div className="rapor-container">
      <header className="rapor-header">
        <div className="rapor-header-content">
          <div>
            <Link to="/stok" className="back-button">← Stok Raporu</Link>
            <h1>SKT Raporu</h1>
          </div>
          <div className="nav-menu-container">
            <button 
              className="nav-menu-button"
              onClick={() => setShowNavMenu(!showNavMenu)}
            >
              ☰ Menü
            </button>
            {showNavMenu && (
              <div className="nav-menu-dropdown">
                <Link to="/" className="nav-menu-item" onClick={() => setShowNavMenu(false)}>
                  🏠 Ana Sayfa
                </Link>
                <Link to="/stok" className="nav-menu-item" onClick={() => setShowNavMenu(false)}>
                  📊 Stok Raporu
                </Link>
                <Link to="/stok/skt" className="nav-menu-item active" onClick={() => setShowNavMenu(false)}>
                  📅 SKT Raporu
                </Link>
                <Link to="/satis/marka" className="nav-menu-item" onClick={() => setShowNavMenu(false)}>
                  💰 Satış Raporları
                </Link>
                <Link to="/alis/marka" className="nav-menu-item" onClick={() => setShowNavMenu(false)}>
                  🛒 Alış Raporları
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Toplam Stok</div>
          <div className="stat-value">{totalStock.toLocaleString('tr-TR')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">SKT Geçmiş</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>
            {getCategoryStats(sktCategories.gecmis).totalAdet.toLocaleString('tr-TR')}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">SKT 3 Ay Kaldı</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {getCategoryStats(sktCategories.ucAy).totalAdet.toLocaleString('tr-TR')}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">SKT 6 Ay Kaldı</div>
          <div className="stat-value" style={{ color: '#3b82f6' }}>
            {getCategoryStats(sktCategories.altiAy).totalAdet.toLocaleString('tr-TR')}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">SKT 12+ Ay Kaldı</div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            {getCategoryStats(sktCategories.onIkiAy).totalAdet.toLocaleString('tr-TR')}
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>SKT Dağılımı (Pasta Grafik)</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString('tr-TR')} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>SKT Dağılımı (Bar Grafik)</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString('tr-TR')} />
              <Legend />
              <Bar dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="skt-categories-container">
        {categories.map(category => {
          const stats = getCategoryStats(category.data);
          
          return (
            <div key={category.key} className="skt-category-card">
              <div className="skt-category-header" style={{ borderLeftColor: category.color }}>
                <div className="skt-category-title">
                  <span className="skt-category-icon">{category.icon}</span>
                  <h2>{category.title}</h2>
                  <span className="skt-category-count">({stats.productCount} ürün)</span>
                </div>
                <div className="skt-category-stats">
                  <div className="skt-stat-item">
                    <span className="skt-stat-label">Toplam Adet:</span>
                    <span className="skt-stat-value">{stats.totalAdet.toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="skt-stat-item">
                    <span className="skt-stat-label">Toplam Stoka Oranı:</span>
                    <span className="skt-stat-value">{stats.percentage}%</span>
                  </div>
                </div>
              </div>
              
              {category.data.length > 0 ? (
                <div className="table-card">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Sıra</th>
                        <th>Ürün Adı</th>
                        <th>SKT</th>
                        <th>Adet</th>
                        <th>Oran (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.data
                        .sort((a, b) => a.sktDate - b.sktDate)
                        .map((item, index) => {
                          const itemPercentage = totalStock > 0 
                            ? ((item.toplamAdet / totalStock) * 100).toFixed(2) 
                            : 0;
                          return (
                            <tr key={item.name}>
                              <td><strong>#{index + 1}</strong></td>
                              <td><strong>{item.name}</strong></td>
                              <td>{item.skt}</td>
                              <td>{item.toplamAdet.toLocaleString('tr-TR')}</td>
                              <td>{itemPercentage}%</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="skt-empty-message">
                  Bu kategoride ürün bulunmamaktadır.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SKTRaporu;


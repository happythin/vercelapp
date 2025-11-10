import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Header from '../components/Header';
import { fetchSalesData, groupByProduct } from '../services/sheetsService';
import './Dashboard.css';

const SKTRaporu = () => {
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState({});
  const [sktCategories, setSktCategories] = useState({
    gecmis: [],
    ucAy: [],
    altiAy: [],
    onIkiAy: []
  });

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

  const categorizeBySKT = useCallback((grouped) => {
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
    
    categories.gecmis.sort((a, b) => b.toplamAdet - a.toplamAdet);
    categories.ucAy.sort((a, b) => b.toplamAdet - a.toplamAdet);
    categories.altiAy.sort((a, b) => b.toplamAdet - a.toplamAdet);
    categories.onIkiAy.sort((a, b) => b.toplamAdet - a.toplamAdet);
    
    setSktCategories({
      gecmis: categories.gecmis,
      ucAy: categories.ucAy,
      altiAy: categories.altiAy,
      onIkiAy: categories.onIkiAy
    });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const salesData = await fetchSalesData();
      const grouped = groupByProduct(salesData);
      setGroupedData(grouped);
      categorizeBySKT(grouped);
    } finally {
      setLoading(false);
    }
  }, [categorizeBySKT]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      <div className="dashboard-page">
        <Header pageTitle="STOK RAPORU (SKT)" breadcrumb="Anasayfa > Stok > SKT >" />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', color: '#e0e0e0', padding: '2rem' }}>Yükleniyor...</div>
        </div>
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
    <div className="dashboard-page">
      <Header pageTitle="STOK RAPORU (SKT)" breadcrumb="Anasayfa > Stok > SKT >" />

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">DEPO STOK DURUMU</h2>
            <span className="section-subtitle">-</span>
          </div>
          
          <div className="period-grid">
            <div style={{ 
              background: 'rgba(102, 126, 234, 0.05)', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center',
              color: '#e0e0e0'
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Toplam Stok</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{totalStock.toLocaleString('tr-TR')}</div>
            </div>
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center',
              color: '#ef4444'
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>SKT Geçmiş</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {getCategoryStats(sktCategories.gecmis).totalAdet.toLocaleString('tr-TR')}
              </div>
            </div>
            <div style={{ 
              background: 'rgba(245, 158, 11, 0.1)', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center',
              color: '#f59e0b'
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>SKT 3 Ay Kaldı</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {getCategoryStats(sktCategories.ucAy).totalAdet.toLocaleString('tr-TR')}
              </div>
            </div>
            <div style={{ 
              background: 'rgba(59, 130, 246, 0.1)', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center',
              color: '#3b82f6'
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>SKT 6 Ay Kaldı</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {getCategoryStats(sktCategories.altiAy).totalAdet.toLocaleString('tr-TR')}
              </div>
            </div>
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.1)', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center',
              color: '#10b981'
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>SKT 12+ Ay Kaldı</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {getCategoryStats(sktCategories.onIkiAy).totalAdet.toLocaleString('tr-TR')}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3 className="subsection-title">SKT Dağılımı</h3>
          <div className="period-grid">
            <div className="chart-container">
              <h4 style={{ color: '#e0e0e0', marginBottom: '1rem' }}>Pasta Grafik</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
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

            <div className="chart-container">
              <h4 style={{ color: '#e0e0e0', marginBottom: '1rem' }}>Bar Grafik</h4>
              <ResponsiveContainer width="100%" height={300}>
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
        </div>

        <div className="dashboard-section">
          <h3 className="subsection-title">SKT Kategorileri</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {categories.map(category => {
          const stats = getCategoryStats(category.data);
          
          return (
            <div key={category.key} style={{ 
              background: '#2d2d2d', 
              borderRadius: '12px', 
              padding: '1.5rem',
              border: `2px solid ${category.color}`,
              borderLeft: `6px solid ${category.color}`
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{category.icon}</span>
                  <h4 style={{ color: '#e0e0e0', margin: 0 }}>{category.title}</h4>
                  <span style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>({stats.productCount} ürün)</span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ color: '#b0b0b0', fontSize: '0.85rem' }}>Toplam Adet: </span>
                    <span style={{ color: '#e0e0e0', fontWeight: '600' }}>{stats.totalAdet.toLocaleString('tr-TR')}</span>
                  </div>
                  <div>
                    <span style={{ color: '#b0b0b0', fontSize: '0.85rem' }}>Oran: </span>
                    <span style={{ color: '#e0e0e0', fontWeight: '600' }}>{stats.percentage}%</span>
                  </div>
                </div>
              </div>
              
              {category.data.length > 0 ? (
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
              ) : (
                <div style={{ textAlign: 'center', color: '#b0b0b0', padding: '2rem' }}>
                  Bu kategoride ürün bulunmamaktadır.
                </div>
              )}
            </div>
          );
        })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SKTRaporu;


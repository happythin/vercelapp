import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Header from '../components/Header';
import Accordion from '../components/Accordion';
import { fetchSalesData, groupByProduct } from '../services/sheetsService';
import './Dashboard.css';

const UrunRaporu = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState({});
  const [selectedProduct, setSelectedProduct] = useState('Tümü');
  const [sortColumn, setSortColumn] = useState('toplamAdet');
  const [sortDirection, setSortDirection] = useState('desc');
  const [detailedView, setDetailedView] = useState(null);
  const [periodSortColumn, setPeriodSortColumn] = useState('toplamAdet');
  const [periodSortDirection, setPeriodSortDirection] = useState('desc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const salesData = await fetchSalesData();
      setData(salesData);
      const grouped = groupByProduct(salesData);
      setGroupedData(grouped);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handlePeriodSort = (column) => {
    if (periodSortColumn === column) {
      setPeriodSortDirection(periodSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setPeriodSortColumn(column);
      setPeriodSortDirection('desc');
    }
  };

  const openDetailedView = (period) => {
    setDetailedView(period);
  };

  const closeDetailedView = () => {
    setDetailedView(null);
  };

  const getSortedData = () => {
    const sortedData = Object.entries(groupedData).map(([urun, degerler]) => ({
      name: urun.length > 15 ? urun.substring(0, 15) + '...' : urun,
      fullName: urun,
      toplamAdet: degerler.toplamAdet || 0,
      aylikOrtalama: (degerler.toplamAdet || 0) / 12,
      aylikVeriler: degerler.aylikVeriler || {}
    }));

    return sortedData.sort((a, b) => {
      let aValue, bValue;
      
      if (sortColumn === 'name') {
        aValue = a.fullName.toLowerCase();
        bValue = b.fullName.toLowerCase();
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue, 'tr')
          : bValue.localeCompare(aValue, 'tr');
      } else if (sortColumn === 'toplamAdet') {
        aValue = a.toplamAdet;
        bValue = b.toplamAdet;
      } else if (sortColumn === 'aylikOrtalama') {
        aValue = a.aylikOrtalama;
        bValue = b.aylikOrtalama;
      }
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  const chartData = getSortedData();

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#8b5cf6', '#ec4899'];
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const getMonthlyData = (productName = 'Tümü') => {
    const monthlyTotals = {};
    months.forEach(month => {
      monthlyTotals[month] = 0;
    });
    
    if (productName === 'Tümü') {
      Object.values(groupedData).forEach(item => {
        months.forEach(month => {
          monthlyTotals[month] += (item.aylikVeriler?.[month] || 0);
        });
      });
    } else {
      const selectedData = groupedData[productName];
      if (selectedData && selectedData.aylikVeriler) {
        months.forEach(month => {
          monthlyTotals[month] = selectedData.aylikVeriler[month] || 0;
        });
      }
    }
    
    return months.map(month => ({
      ay: month,
      adet: monthlyTotals[month]
    }));
  };

  const generalMonthlyData = getMonthlyData('Tümü');
  const filteredMonthlyData = getMonthlyData(selectedProduct);

  const getPeriodData = (period) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const currentMonthName = months[currentMonth];

    const periodData = Object.entries(groupedData).map(([urun, degerler]) => {
      let toplamSatis = 0;
      const aylikVeriler = degerler.aylikVeriler || {};
      
      if (period === '1gun') {
        const currentMonthTotal = aylikVeriler[currentMonthName] || 0;
        const daysPassed = now.getDate();
        if (daysPassed > 0) {
          toplamSatis = Math.round((currentMonthTotal / daysPassed) * 1);
        }
      } else if (period === '1hafta') {
        const currentMonthTotal = aylikVeriler[currentMonthName] || 0;
        const daysPassed = now.getDate();
        const daysInWeek = Math.min(7, daysPassed);
        if (daysPassed > 0) {
          toplamSatis = Math.round((currentMonthTotal / daysPassed) * daysInWeek);
        }
      } else if (period === '1ay') {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        toplamSatis = aylikVeriler[months[lastMonth]] || 0;
      } else if (period === '3ay') {
        const startMonth = now.getMonth() - 2;
        for (let i = 0; i < 3; i++) {
          const monthIndex = (startMonth + i + 12) % 12;
          toplamSatis += aylikVeriler[months[monthIndex]] || 0;
        }
      } else if (period === '6ay') {
        const startMonth = now.getMonth() - 5;
        for (let i = 0; i < 6; i++) {
          const monthIndex = (startMonth + i + 12) % 12;
          toplamSatis += aylikVeriler[months[monthIndex]] || 0;
        }
      } else if (period === '1yil') {
        Object.values(aylikVeriler).forEach(value => {
          toplamSatis += value || 0;
        });
      }

      return {
        name: urun,
        fullName: urun,
        toplamAdet: toplamSatis
      };
    });

    return periodData.filter(item => item.toplamAdet > 0);
  };

  const getSortedPeriodData = (period) => {
    const periodData = getPeriodData(period);
    
    return periodData.sort((a, b) => {
      let aValue, bValue;
      
      if (periodSortColumn === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        return periodSortDirection === 'asc' 
          ? aValue.localeCompare(bValue, 'tr')
          : bValue.localeCompare(aValue, 'tr');
      } else if (periodSortColumn === 'toplamAdet') {
        aValue = a.toplamAdet;
        bValue = b.toplamAdet;
      }
      
      return periodSortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }).slice(0, 50);
  };

  const periods = [
    { key: '1gun', label: 'Son 1 Gün', icon: '📅' },
    { key: '1hafta', label: 'Son 1 Hafta', icon: '📆' },
    { key: '1ay', label: 'Son 1 Ay', icon: '🗓️' },
    { key: '3ay', label: 'Son 3 Ay', icon: '📊' },
    { key: '6ay', label: 'Son 6 Ay', icon: '📈' },
    { key: '1yil', label: 'Son 1 Yıl', icon: '📉' }
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <Header pageTitle="SATIŞ RAPORU (En Çok Satan)" breadcrumb="Anasayfa > Satış > En Çok Satan >" />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', color: '#e0e0e0', padding: '2rem' }}>Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0 || Object.keys(groupedData).length === 0) {
    return (
      <div className="dashboard-page">
        <Header pageTitle="SATIŞ RAPORU (En Çok Satan)" breadcrumb="Anasayfa > Satış > En Çok Satan >" />
        <div className="dashboard-content">
          <div className="dashboard-section">
            <div style={{ textAlign: 'center', color: '#e0e0e0', padding: '2rem' }}>
              <h2>⚠️ Veri Bulunamadı</h2>
              <p>Google Sheets'ten veri çekilemedi veya veri formatı uygun değil.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toplamAdet = Object.values(groupedData).reduce((sum, item) => sum + (item.toplamAdet || 0), 0);
  const topProducts = chartData.slice(0, 20);

  return (
    <div className="dashboard-page">
      <Header pageTitle="SATIŞ RAPORU (En Çok Satan)" breadcrumb="Anasayfa > Satış > En Çok Satan >" />
      
      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">EN ÇOK SATAN ÜRÜNLER</h2>
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
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Toplam Adet</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{toplamAdet.toLocaleString('tr-TR')}</div>
            </div>
            <div style={{ 
              background: 'rgba(102, 126, 234, 0.05)', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center',
              color: '#e0e0e0'
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Ürün Sayısı</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{Object.keys(groupedData).length}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3 className="subsection-title">Dönem Bazlı Satış Grafikleri</h3>
          
          <div className="period-grid">
            {periods.map(period => {
              const periodData = getPeriodData(period.key);
              const total = periodData.reduce((sum, item) => sum + item.toplamAdet, 0);
              
              return (
                <Accordion 
                  key={period.key}
                  title={`${period.icon} ${period.label}`}
                  defaultOpen={true}
                >
                  <div className="chart-container">
                    {periodData.length > 0 ? (
                      <>
                        <div style={{ 
                          marginBottom: '1rem', 
                          display: 'flex', 
                          gap: '1rem',
                          flexWrap: 'wrap',
                          color: '#e0e0e0',
                          fontSize: '0.9rem'
                        }}>
                          <div>
                            <span style={{ color: '#b0b0b0' }}>Toplam Satış: </span>
                            <strong style={{ color: '#667eea' }}>{total.toLocaleString('tr-TR')} Adet</strong>
                          </div>
                          <div>
                            <span style={{ color: '#b0b0b0' }}>Ürün Sayısı: </span>
                            <strong>{periodData.length}</strong>
                          </div>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={periodData.slice(0, 10).map(item => ({
                            name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
                            fullName: item.fullName,
                            adet: item.toplamAdet
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip 
                              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                              formatter={(value) => [`${value.toLocaleString('tr-TR')} adet`, 'Satış']}
                            />
                            <Bar dataKey="adet" fill="#667eea" name="Satış Adeti" />
                          </BarChart>
                        </ResponsiveContainer>
                        <button 
                          className="stok-detail-button"
                          onClick={() => openDetailedView(period.key)}
                          style={{
                            marginTop: '1rem',
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            width: '100%'
                          }}
                        >
                          Detaylı Liste →
                        </button>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', color: '#b0b0b0', padding: '2rem' }}>
                        Bu dönemde satış verisi bulunmamaktadır.
                      </div>
                    )}
                  </div>
                </Accordion>
              );
            })}
          </div>
        </div>

        <div className="dashboard-section">
          <h3 className="subsection-title">En Çok Satan Ürünler (Top 20)</h3>
          <div className="period-grid">
            <div className="chart-container">
              <h4 style={{ color: '#e0e0e0', marginBottom: '1rem' }}>Bar Grafik</h4>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip 
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  />
                  <Legend />
                  <Bar dataKey="toplamAdet" fill="#667eea" name="Toplam Adet" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h4 style={{ color: '#e0e0e0', marginBottom: '1rem' }}>Pasta Grafik (Top 10)</h4>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={topProducts.slice(0, 10)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="toplamAdet"
                  >
                    {topProducts.slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3 className="subsection-title">Aylık Satış Adetleri</h3>
          <div className="period-grid">
            <div className="chart-container">
              <h4 style={{ color: '#e0e0e0', marginBottom: '1rem' }}>Genel</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={generalMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ay" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="adet" stroke="#667eea" strokeWidth={2} name="Satış Adeti" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h4 style={{ color: '#e0e0e0', marginBottom: '1rem' }}>Filtrelenmiş</h4>
              <div style={{ marginBottom: '1rem' }}>
                <select 
                  value={selectedProduct} 
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    borderRadius: '8px',
                    border: '1px solid #3a3a3a',
                    backgroundColor: '#2d2d2d',
                    color: '#e0e0e0',
                    cursor: 'pointer',
                    minWidth: '200px'
                  }}
                >
                  <option value="Tümü">Tüm Ürünler</option>
                  {chartData.map((item) => (
                    <option key={item.fullName} value={item.fullName}>{item.fullName}</option>
                  ))}
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filteredMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ay" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="adet" stroke="#764ba2" strokeWidth={2} name="Satış Adeti" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3 className="subsection-title">Detaylı Ürün İstatistikleri</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  style={{ cursor: 'pointer' }}
                >
                  Ürün Adı {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('toplamAdet')}
                  style={{ cursor: 'pointer' }}
                >
                  Toplam Adet {sortColumn === 'toplamAdet' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('aylikOrtalama')}
                  style={{ cursor: 'pointer' }}
                >
                  Aylık Ortalama {sortColumn === 'aylikOrtalama' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item) => (
                <tr key={item.fullName}>
                  <td><strong>{item.fullName}</strong></td>
                  <td>{item.toplamAdet ? item.toplamAdet.toLocaleString('tr-TR') : '0'}</td>
                  <td>{item.aylikOrtalama.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detailedView && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={closeDetailedView}
        >
          <div 
            style={{
              background: '#2d2d2d',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#e0e0e0', margin: 0 }}>
                {periods.find(p => p.key === detailedView)?.label} - Detaylı Liste
              </h2>
              <button 
                onClick={closeDetailedView}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e0e0e0',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  padding: '0 1rem'
                }}
              >
                ×
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sıra</th>
                  <th 
                    onClick={() => handlePeriodSort('name')}
                    style={{ cursor: 'pointer' }}
                  >
                    Ürün Adı {periodSortColumn === 'name' && (periodSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handlePeriodSort('toplamAdet')}
                    style={{ cursor: 'pointer' }}
                  >
                    Satış Adeti {periodSortColumn === 'toplamAdet' && (periodSortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {getSortedPeriodData(detailedView).length > 0 ? (
                  getSortedPeriodData(detailedView).map((item, index) => (
                    <tr key={item.name}>
                      <td><strong>#{index + 1}</strong></td>
                      <td><strong>{item.fullName}</strong></td>
                      <td>{item.toplamAdet.toLocaleString('tr-TR')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: '#b0b0b0' }}>
                      Bu dönemde satış verisi bulunmamaktadır.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrunRaporu;

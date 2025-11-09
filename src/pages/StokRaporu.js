import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchSalesData, groupByProduct } from '../services/sheetsService';
import './RaporSayfasi.css';

const StokRaporu = () => {
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState({});
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [expandedPeriods, setExpandedPeriods] = useState({});
  const [detailedView, setDetailedView] = useState(null);
  const [sortColumn, setSortColumn] = useState('toplamAdet');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const salesData = await fetchSalesData();
      const grouped = groupByProduct(salesData);
      setGroupedData(grouped);
    } finally {
      setLoading(false);
    }
  };

  const togglePeriod = (period) => {
    setExpandedPeriods(prev => ({
      ...prev,
      [period]: !prev[period]
    }));
  };

  const openDetailedView = (period) => {
    setDetailedView(period);
  };

  const closeDetailedView = () => {
    setDetailedView(null);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getPeriodData = (period) => {
    const now = new Date();
    let startDate = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const currentMonthName = months[currentMonth];

    switch (period) {
      case '1gun':
        startDate.setDate(now.getDate() - 1);
        break;
      case '1hafta':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1ay':
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        startDate = new Date(lastMonthYear, lastMonth, 1);
        break;
      case '3ay':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6ay':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1yil':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0);
    }

    const periodData = Object.entries(groupedData).map(([urun, degerler]) => {
      let toplamAdet = 0;
      const aylikVeriler = degerler.aylikVeriler || {};
      
      if (period === '1gun') {
        const currentMonthTotal = aylikVeriler[currentMonthName] || 0;
        const daysPassed = now.getDate();
        if (daysPassed > 0) {
          toplamAdet = Math.round((currentMonthTotal / daysPassed) * 1);
        } else {
          toplamAdet = 0;
        }
      } else if (period === '1hafta') {
        const currentMonthTotal = aylikVeriler[currentMonthName] || 0;
        const daysPassed = now.getDate();
        const daysInWeek = Math.min(7, daysPassed);
        if (daysPassed > 0) {
          toplamAdet = Math.round((currentMonthTotal / daysPassed) * daysInWeek);
        } else {
          toplamAdet = 0;
        }
      } else {
        Object.keys(aylikVeriler).forEach(ay => {
          const ayIndex = months.indexOf(ay);
          if (ayIndex !== -1) {
            let ayTarihi = new Date(currentYear, ayIndex, 1);
            if (period === '1ay') {
              if (ayTarihi.getTime() === startDate.getTime()) {
                toplamAdet += aylikVeriler[ay] || 0;
              }
            } else {
              if (ayTarihi >= startDate) {
                toplamAdet += aylikVeriler[ay] || 0;
              }
            }
          }
        });
      }

      return {
        name: urun,
        toplamAdet: toplamAdet
      };
    });

    return periodData.filter(item => item.toplamAdet > 0);
  };

  const getSortedPeriodData = (period) => {
    const periodData = getPeriodData(period);
    
    return periodData.sort((a, b) => {
      let aValue, bValue;
      
      if (sortColumn === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue, 'tr')
          : bValue.localeCompare(aValue, 'tr');
      } else if (sortColumn === 'toplamAdet') {
        aValue = a.toplamAdet;
        bValue = b.toplamAdet;
      }
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
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
      <div className="rapor-container">
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="rapor-container">
      <header className="rapor-header stok-header-compact">
        <div className="rapor-header-content">
          <div>
            <Link to="/" className="back-button">← Ana Sayfa</Link>
            <h1>Stok Raporu</h1>
          </div>
          <div className="nav-menu-container">
            <button 
              className="nav-menu-button stok-menu-button"
              onClick={() => setShowNavMenu(!showNavMenu)}
            >
              ☰ Menü
            </button>
            {showNavMenu && (
              <div className="nav-menu-dropdown stok-menu-dropdown">
                <Link to="/" className="nav-menu-item" onClick={() => setShowNavMenu(false)}>
                  🏠 Ana Sayfa
                </Link>
                <Link to="/stok" className="nav-menu-item active" onClick={() => setShowNavMenu(false)}>
                  📊 Stok Raporu
                </Link>
                <Link to="/stok/skt" className="nav-menu-item" onClick={() => setShowNavMenu(false)}>
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

      <div className="stok-periods-container">
        {periods.map(period => {
          const periodData = getPeriodData(period.key);
          const sortedPeriodData = periodData.sort((a, b) => b.toplamAdet - a.toplamAdet);
          const topProducts = sortedPeriodData.slice(0, 5);
          const chartData = topProducts.map(item => ({
            name: item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name,
            value: item.toplamAdet
          }));

          return (
            <div key={period.key} className="stok-period-card">
              <div 
                className="stok-period-header"
                onClick={() => togglePeriod(period.key)}
              >
                <div className="stok-period-title">
                  <span className="stok-period-icon">{period.icon}</span>
                  <h2>{period.label}</h2>
                  <span className="stok-period-count">({periodData.length} ürün)</span>
                </div>
                <div className="stok-period-toggle">
                  {expandedPeriods[period.key] ? '▼' : '▶'}
                </div>
              </div>

              {!expandedPeriods[period.key] && periodData.length > 0 && (
                <div className="stok-period-preview">
                  <div className="stok-chart-preview">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-45} textAnchor="end" height={45} />
                        <YAxis tick={{ fontSize: 8 }} width={35} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#667eea" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <button 
                    className="stok-detail-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetailedView(period.key);
                    }}
                  >
                    Detaylı Görünüm →
                  </button>
                </div>
              )}

              {expandedPeriods[period.key] && (
                <div className="stok-period-content">
                  <div className="table-card">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Sıra</th>
                          <th 
                            className="sortable-header"
                            onClick={() => handleSort('name')}
                            style={{ cursor: 'pointer' }}
                          >
                            Ürün Adı {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th 
                            className="sortable-header"
                            onClick={() => handleSort('toplamAdet')}
                            style={{ cursor: 'pointer' }}
                          >
                            Toplam Satış Adeti {sortColumn === 'toplamAdet' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSortedPeriodData(period.key).length > 0 ? (
                          getSortedPeriodData(period.key).map((item, index) => (
                            <tr key={item.name}>
                              <td><strong>#{index + 1}</strong></td>
                              <td><strong>{item.name}</strong></td>
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
        })}
      </div>

      {detailedView && (
        <div className="stok-modal-overlay" onClick={closeDetailedView}>
          <div className="stok-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="stok-modal-header">
              <h2>{periods.find(p => p.key === detailedView)?.label}</h2>
              <button className="stok-modal-close" onClick={closeDetailedView}>×</button>
            </div>
            <div className="stok-modal-body">
              <div className="table-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sıra</th>
                      <th 
                        className="sortable-header"
                        onClick={() => handleSort('name')}
                        style={{ cursor: 'pointer' }}
                      >
                        Ürün Adı {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="sortable-header"
                        onClick={() => handleSort('toplamAdet')}
                        style={{ cursor: 'pointer' }}
                      >
                        Toplam Satış Adeti {sortColumn === 'toplamAdet' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedPeriodData(detailedView).length > 0 ? (
                      getSortedPeriodData(detailedView).map((item, index) => (
                        <tr key={item.name}>
                          <td><strong>#{index + 1}</strong></td>
                          <td><strong>{item.name}</strong></td>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default StokRaporu;


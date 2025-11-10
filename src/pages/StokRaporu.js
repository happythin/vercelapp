import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import Header from '../components/Header';
import Accordion from '../components/Accordion';
import { fetchSalesData, groupByProduct } from '../services/sheetsService';
import './Dashboard.css';

const StokRaporu = () => {
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState({});
  const INITIAL_STOCK = 300000;
  const [detailedView, setDetailedView] = useState(null);
  const [sortColumn, setSortColumn] = useState('stokAdet');
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
    const currentMonth = now.getMonth();
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const currentMonthName = months[currentMonth];

    const periodData = Object.entries(groupedData).map(([urun, degerler]) => {
      let toplamSatis = 0;
      const aylikVeriler = degerler.aylikVeriler || {};
      
      if (period === '1gun') {
        const daysPassed = now.getDate();
        const currentMonthTotal = aylikVeriler[currentMonthName] || 0;
        const buguneKadarBuAy = daysPassed > 0 ? Math.round((currentMonthTotal / 30) * daysPassed) : 0;
        
        let gecmisAylarToplam = 0;
        months.forEach((month, index) => {
          if (index < currentMonth) {
            gecmisAylarToplam += aylikVeriler[month] || 0;
          }
        });
        
        toplamSatis = buguneKadarBuAy + gecmisAylarToplam;
      } else if (period === '1hafta') {
        const daysPassed = now.getDate();
        const daysInWeek = Math.min(7, daysPassed);
        const currentMonthTotal = aylikVeriler[currentMonthName] || 0;
        const sonHaftayaKadarBuAy = daysInWeek > 0 ? Math.round((currentMonthTotal / 30) * daysInWeek) : 0;
        
        let gecmisAylarToplam = 0;
        months.forEach((month, index) => {
          if (index < currentMonth) {
            gecmisAylarToplam += aylikVeriler[month] || 0;
          }
        });
        
        toplamSatis = sonHaftayaKadarBuAy + gecmisAylarToplam;
      } else if (period === '1ay') {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastMonthName = months[lastMonth];
        
        toplamSatis = aylikVeriler[lastMonthName] || 0;
        months.forEach((month, index) => {
          if (index < lastMonth) {
            toplamSatis += aylikVeriler[month] || 0;
          }
        });
      } else if (period === '3ay') {
        const startMonthIndex = (now.getMonth() - 3 + 12) % 12;
        
        for (let i = 0; i < 3; i++) {
          const monthIndex = (startMonthIndex + i) % 12;
          toplamSatis += aylikVeriler[months[monthIndex]] || 0;
        }
        
        for (let i = 0; i < startMonthIndex; i++) {
          toplamSatis += aylikVeriler[months[i]] || 0;
        }
      } else if (period === '6ay') {
        const startMonthIndex = (now.getMonth() - 6 + 12) % 12;
        
        for (let i = 0; i < 6; i++) {
          const monthIndex = (startMonthIndex + i) % 12;
          toplamSatis += aylikVeriler[months[monthIndex]] || 0;
        }
        
        for (let i = 0; i < startMonthIndex; i++) {
          toplamSatis += aylikVeriler[months[i]] || 0;
        }
      } else if (period === '1yil') {
        Object.values(aylikVeriler).forEach(value => {
          toplamSatis += value || 0;
        });
      }

      const stokAdet = Math.max(0, INITIAL_STOCK - toplamSatis);

      return {
        name: urun,
        toplamSatis: toplamSatis,
        stokAdet: stokAdet
      };
    });

    return periodData.filter(item => item.stokAdet > 0);
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
      } else if (sortColumn === 'stokAdet') {
        aValue = a.stokAdet;
        bValue = b.stokAdet;
      } else if (sortColumn === 'toplamSatis') {
        aValue = a.toplamSatis;
        bValue = b.toplamSatis;
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
      <div className="dashboard-page">
        <Header pageTitle="STOK RAPORU" breadcrumb="Anasayfa > Stok >" />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', color: '#e0e0e0', padding: '2rem' }}>Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Header pageTitle="STOK RAPORU" breadcrumb="Anasayfa > Stok >" />
      
      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Güncel Stok Durumu</h2>
            <span className="section-subtitle">-</span>
          </div>
          
          <div className="period-grid">
            {periods.map(period => {
              const periodData = getPeriodData(period.key);
              const totalStok = periodData.reduce((sum, item) => sum + item.stokAdet, 0);
              const totalSatis = periodData.reduce((sum, item) => sum + item.toplamSatis, 0);
              
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
                            <span style={{ color: '#b0b0b0' }}>Toplam Stok: </span>
                            <strong style={{ color: '#667eea' }}>{totalStok.toLocaleString('tr-TR')} Adet</strong>
                          </div>
                          <div>
                            <span style={{ color: '#b0b0b0' }}>Toplam Satış: </span>
                            <strong style={{ color: '#f59e0b' }}>{totalSatis.toLocaleString('tr-TR')} Adet</strong>
                          </div>
                          <div>
                            <span style={{ color: '#b0b0b0' }}>Ürün Sayısı: </span>
                            <strong>{periodData.length}</strong>
                          </div>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={periodData.slice(0, 10).map(item => ({
                            name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
                            fullName: item.name,
                            stok: item.stokAdet,
                            satis: item.toplamSatis
                          }))}>
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip 
                              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                              formatter={(value, name) => {
                                if (name === 'stok') return [`${value.toLocaleString('tr-TR')} adet`, 'Stokta Kalan'];
                                if (name === 'satis') return [`${value.toLocaleString('tr-TR')} adet`, 'Toplam Satış'];
                                return [value, name];
                              }}
                            />
                            <Bar dataKey="stok" fill="#667eea" name="Stokta Kalan" />
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
                        Bu dönemde stokta kalan ürün bulunmamaktadır.
                      </div>
                    )}
                  </div>
                </Accordion>
              );
            })}
          </div>
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
                    onClick={() => handleSort('name')}
                    style={{ cursor: 'pointer' }}
                  >
                    Ürün Adı {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('stokAdet')}
                    style={{ cursor: 'pointer' }}
                  >
                    Stokta Kalan {sortColumn === 'stokAdet' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('toplamSatis')}
                    style={{ cursor: 'pointer' }}
                  >
                    Toplam Satış {sortColumn === 'toplamSatis' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {getSortedPeriodData(detailedView).length > 0 ? (
                  getSortedPeriodData(detailedView).map((item, index) => (
                    <tr key={item.name}>
                      <td><strong>#{index + 1}</strong></td>
                      <td><strong>{item.name}</strong></td>
                      <td style={{ color: '#667eea', fontWeight: '600' }}>
                        {item.stokAdet.toLocaleString('tr-TR')}
                      </td>
                      <td style={{ color: '#f59e0b' }}>
                        {item.toplamSatis.toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#b0b0b0' }}>
                      Bu dönemde stokta kalan ürün bulunmamaktadır.
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

export default StokRaporu;

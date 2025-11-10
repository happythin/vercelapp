import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Header from '../components/Header';
import { fetchSalesData, groupByCategory } from '../services/sheetsService';
import './Dashboard.css';

const KategoriRaporu = () => {
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [sortColumn, setSortColumn] = useState('toplamAdet');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showNavMenu, setShowNavMenu] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const salesData = await fetchSalesData();
      const grouped = groupByCategory(salesData);
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

  const getSortedData = () => {
    const sortedData = Object.entries(groupedData).map(([kategori, degerler]) => ({
      name: kategori,
      toplamAdet: degerler.toplamAdet,
      aylikOrtalama: degerler.toplamAdet / 12,
      aylikVeriler: degerler.aylikVeriler || {}
    }));

    return sortedData.sort((a, b) => {
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
  const getMonthlyData = (categoryName = 'Tümü') => {
    const monthlyTotals = {};
    months.forEach(month => {
      monthlyTotals[month] = 0;
    });
    
    if (categoryName === 'Tümü') {
      Object.values(groupedData).forEach(item => {
        months.forEach(month => {
          monthlyTotals[month] += (item.aylikVeriler?.[month] || 0);
        });
      });
    } else {
      const selectedData = groupedData[categoryName];
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
  const filteredMonthlyData = getMonthlyData(selectedCategory);

  if (loading) {
    return (
      <div className="dashboard-page">
        <Header pageTitle="SATIŞ RAPORU (Kategori)" breadcrumb="Anasayfa > Satış > Kategori >" />
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', color: '#e0e0e0', padding: '2rem' }}>Yükleniyor...</div>
        </div>
      </div>
    );
  }

  const toplamAdet = Object.values(groupedData).reduce((sum, item) => sum + item.toplamAdet, 0);

  return (
    <div className="dashboard-page">
      <Header pageTitle="SATIŞ RAPORU (Kategori)" breadcrumb="Anasayfa > Satış > Kategori >" />
      
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
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Kategori Sayısı</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{Object.keys(groupedData).length}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3 className="subsection-title">Kategori Bazında Satış Adetleri</h3>
          <div className="period-grid">
            <div className="chart-container">
              <h4 style={{ color: '#e0e0e0', marginBottom: '1rem' }}>Bar Grafik</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="toplamAdet" fill="#764ba2" name="Toplam Adet" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h4 style={{ color: '#e0e0e0', marginBottom: '1rem' }}>Pasta Grafik</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="toplamAdet"
                  >
                    {chartData.map((entry, index) => (
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
                  <Line type="monotone" dataKey="adet" stroke="#764ba2" strokeWidth={2} name="Satış Adeti" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h4 style={{ color: '#e0e0e0', marginBottom: '1rem' }}>Filtrelenmiş</h4>
              <div style={{ marginBottom: '1rem' }}>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
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
                  <option value="Tümü">Tüm Kategoriler</option>
                  {chartData.map((item) => (
                    <option key={item.name} value={item.name}>{item.name}</option>
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
                  <Line type="monotone" dataKey="adet" stroke="#f093fb" strokeWidth={2} name="Satış Adeti" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3 className="subsection-title">Detaylı Kategori İstatistikleri</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  style={{ cursor: 'pointer' }}
                >
                  Kategori {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                <tr key={item.name}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.toplamAdet.toLocaleString('tr-TR')}</td>
                  <td>{item.aylikOrtalama.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KategoriRaporu;

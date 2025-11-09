import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { fetchSalesData, groupByCategory } from '../services/sheetsService';
import './RaporSayfasi.css';

const KategoriAlis = () => {
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
      <div className="rapor-container">
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  const toplamAdet = Object.values(groupedData).reduce((sum, item) => sum + item.toplamAdet, 0);

  return (
    <div className="rapor-container">
      <header className="rapor-header">
        <div className="rapor-header-content">
          <div>
            <Link to="/" className="back-button">← Ana Sayfa</Link>
            <h1>Kategori Bazlı Alış Raporu</h1>
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
                <Link to="/satis/marka" className="nav-menu-item" onClick={() => setShowNavMenu(false)}>
                  💰 Satış Raporları
                </Link>
                <Link to="/alis/marka" className="nav-menu-item" onClick={() => setShowNavMenu(false)}>
                  🏷️ Marka Bazlı
                </Link>
                <Link to="/alis/kategori" className="nav-menu-item active" onClick={() => setShowNavMenu(false)}>
                  📦 Kategori Bazlı
                </Link>
                <Link to="/alis/urun" className="nav-menu-item" onClick={() => setShowNavMenu(false)}>
                  🛍️ Ürün Bazlı
                </Link>
                <Link to="/alis/musteri" className="nav-menu-item" onClick={() => setShowNavMenu(false)}>
                  👥 Müşteri Bazlı
                </Link>
                <Link to="/alis/kanal" className="nav-menu-item" onClick={() => setShowNavMenu(false)}>
                  🏪 Satış Kanalı
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Toplam Adet</div>
          <div className="stat-value">{toplamAdet.toLocaleString('tr-TR')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Kategori Sayısı</div>
          <div className="stat-value">{Object.keys(groupedData).length}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Kategori Bazında Alış Adetleri</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="toplamAdet" fill="#764ba2" name="Toplam Adet" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Kategori Dağılımı (Pasta Grafik)</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
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

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Aylık Alış Adetleri (Genel)</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={generalMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ay" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="adet" stroke="#764ba2" strokeWidth={2} name="Alış Adeti" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Aylık Alış Adetleri (Filtrelenmiş)</h2>
          <div style={{ marginBottom: '1rem' }}>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid #3a3a3a',
                backgroundColor: '#1a1a1a',
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
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ay" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="adet" stroke="#f093fb" strokeWidth={2} name="Alış Adeti" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="table-card">
        <h2>Detaylı Kategori İstatistikleri</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th 
                onClick={() => handleSort('name')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Kategori {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('toplamAdet')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Toplam Adet {sortColumn === 'toplamAdet' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('aylikOrtalama')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
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
  );
};

export default KategoriAlis;


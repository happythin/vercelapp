import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { fetchSalesData, groupByChannel } from '../services/sheetsService';
import './RaporSayfasi.css';

const KanalAlis = () => {
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState({});
  const [selectedChannel, setSelectedChannel] = useState('Tümü');
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
      const grouped = groupByChannel(salesData);
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

  const toplamAdet = Object.values(groupedData).reduce((sum, item) => sum + item.toplamAdet, 0);

  const getSortedData = () => {
    const sortedData = Object.entries(groupedData).map(([kanal, degerler]) => ({
      name: kanal,
      toplamAdet: degerler.toplamAdet,
      aylikOrtalama: degerler.toplamAdet / 12,
      payi: (degerler.toplamAdet / toplamAdet) * 100,
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
      } else if (sortColumn === 'payi') {
        aValue = a.payi;
        bValue = b.payi;
      }
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  const chartData = getSortedData();

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#8b5cf6', '#ec4899'];
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const getMonthlyData = (channelName = 'Tümü') => {
    const monthlyTotals = {};
    months.forEach(month => {
      monthlyTotals[month] = 0;
    });
    
    if (channelName === 'Tümü') {
      Object.values(groupedData).forEach(item => {
        months.forEach(month => {
          monthlyTotals[month] += (item.aylikVeriler?.[month] || 0);
        });
      });
    } else {
      const selectedData = groupedData[channelName];
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
  const filteredMonthlyData = getMonthlyData(selectedChannel);

  if (loading) {
    return (
      <div className="rapor-container">
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  const enCokAlanKanal = chartData.length > 0 ? chartData[0] : null;

  return (
    <div className="rapor-container">
      <header className="rapor-header">
        <div className="rapor-header-content">
          <div>
            <Link to="/" className="back-button">← Ana Sayfa</Link>
            <h1>Satış Kanalı Bazlı Alış Raporu</h1>
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
                <Link to="/alis/kategori" className="nav-menu-item" onClick={() => setShowNavMenu(false)}>
                  📦 Kategori Bazlı
                </Link>
                <Link to="/alis/urun" className="nav-menu-item" onClick={() => setShowNavMenu(false)}>
                  🛍️ Ürün Bazlı
                </Link>
                <Link to="/alis/musteri" className="nav-menu-item" onClick={() => setShowNavMenu(false)}>
                  👥 Müşteri Bazlı
                </Link>
                <Link to="/alis/kanal" className="nav-menu-item active" onClick={() => setShowNavMenu(false)}>
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
          <div className="stat-label">Kanal Sayısı</div>
          <div className="stat-value">{Object.keys(groupedData).length}</div>
        </div>
        {enCokAlanKanal && (
          <div className="stat-card">
            <div className="stat-label">En Çok Alan Kanal</div>
            <div className="stat-value" style={{ fontSize: '1.2rem' }}>{enCokAlanKanal.name}</div>
            <div style={{ fontSize: '0.9rem', color: '#b0b0b0', marginTop: '0.5rem' }}>
              {enCokAlanKanal.toplamAdet.toLocaleString('tr-TR')} adet
            </div>
          </div>
        )}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Kanal Bazında Alış Adetleri</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="toplamAdet" fill="#667eea" name="Toplam Adet" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Kanal Dağılımı (Pasta Grafik)</h2>
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
              <Line type="monotone" dataKey="adet" stroke="#667eea" strokeWidth={2} name="Alış Adeti" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Aylık Alış Adetleri (Filtrelenmiş)</h2>
          <div style={{ marginBottom: '1rem' }}>
            <select 
              value={selectedChannel} 
              onChange={(e) => setSelectedChannel(e.target.value)}
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
              <option value="Tümü">Tüm Kanallar</option>
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
              <Line type="monotone" dataKey="adet" stroke="#00f2fe" strokeWidth={2} name="Alış Adeti" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="table-card">
        <h2>Detaylı Kanal İstatistikleri</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th 
                onClick={() => handleSort('name')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Satış Kanalı {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
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
              <th 
                onClick={() => handleSort('payi')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Toplam Alış İçindeki Payı {sortColumn === 'payi' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((item) => (
              <tr key={item.name}>
                <td><strong>{item.name}</strong></td>
                <td>{item.toplamAdet.toLocaleString('tr-TR')}</td>
                <td>{item.aylikOrtalama.toFixed(2)}</td>
                <td>
                  <strong style={{ color: '#667eea' }}>{item.payi.toFixed(2)}%</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KanalAlis;

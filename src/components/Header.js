import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ pageTitle, breadcrumb }) => {
  const [currentDate, setCurrentDate] = useState('');
  const [exchangeRates, setExchangeRates] = useState({ usd: null, eur: null });
  const location = useLocation();

  useEffect(() => {
    // Tarihi güncelle
    const updateDate = () => {
      const now = new Date();
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      };
      setCurrentDate(now.toLocaleDateString('tr-TR', options));
    };
    updateDate();
    const interval = setInterval(updateDate, 60000); // Her dakika güncelle

    // Döviz kurlarını al (örnek API - gerçek API kullanılabilir)
    // Şimdilik placeholder değerler
    setExchangeRates({
      usd: '41,89',
      eur: '48,46'
    });

    return () => clearInterval(interval);
  }, []);

  const getBreadcrumbItems = () => {
    if (location.pathname === '/') return [];
    
    const pathParts = location.pathname.split('/').filter(p => p);
    const breadcrumbItems = [];
    
    // Ana sayfa linki her zaman ilk sırada
    breadcrumbItems.push({ label: 'Ana Sayfa', path: '/' });
    
    // Path parçalarını işle
    let currentPath = '';
    pathParts.forEach((part, index) => {
      currentPath += '/' + part;
      
      // Türkçe karakterleri düzelt ve label oluştur
      let label = part.charAt(0).toUpperCase() + part.slice(1);
      
      // Özel durumlar için label'ları düzelt
      const partLower = part.toLowerCase();
      const isAlis = pathParts[0] === 'alis';
      
      if (partLower === 'satis') {
        label = 'Satış';
      } else if (partLower === 'alis') {
        label = 'Alış';
      } else if (partLower === 'stok') {
        label = 'Stok';
      } else if (partLower === 'marka') {
        label = 'Marka';
      } else if (partLower === 'kategori') {
        label = 'Kategori';
      } else if (partLower === 'urun') {
        label = isAlis ? 'En Çok Alınan' : 'En Çok Satan';
      } else if (partLower === 'musteri') {
        label = 'Müşteri';
      } else if (partLower === 'kanal') {
        label = isAlis ? 'Tedarikçi' : 'Satış Kanalı';
      } else if (partLower === 'skt') {
        label = 'SKT';
      }
      
      // Her kategori için genel sayfaya yönlendirme
      let targetPath = currentPath;
      if (part === 'satis' && index === 0) {
        targetPath = '/satis'; // Satış genel sayfası
      } else if (part === 'alis' && index === 0) {
        targetPath = '/alis'; // Alış genel sayfası
      } else if (part === 'stok' && index === 0) {
        targetPath = '/stok'; // Stok sayfası
      }
      
      breadcrumbItems.push({ 
        label, 
        path: targetPath,
        isLast: index === pathParts.length - 1
      });
    });
    
    return breadcrumbItems;
  };

  return (
    <header className="dashboard-header">
      <div className="header-top">
        <div className="header-left">
          <Link to="/" className="logo-link">
            <h1 className="logo">Raporla</h1>
          </Link>
          {pageTitle && <h2 className="page-title">{pageTitle}</h2>}
        </div>
        <div className="header-right">
          <div className="date-display">{currentDate}</div>
          <div className="exchange-rates">
            <span className="exchange-rate">$ - {exchangeRates.usd} TL</span>
            <span className="exchange-rate">€ - {exchangeRates.eur} TL</span>
          </div>
        </div>
      </div>
      <div className="header-bottom">
        <div className="breadcrumb">
          {getBreadcrumbItems().map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="breadcrumb-separator">{' > '}</span>}
              {item.isLast ? (
                <span className="breadcrumb-item current">{item.label}</span>
              ) : (
                <Link to={item.path} className="breadcrumb-item breadcrumb-link">
                  {index === 0 ? '🏠 ' : ''}{item.label}
                </Link>
              )}
            </React.Fragment>
          ))}
          {location.pathname !== '/' && <span className="breadcrumb-separator">{' >'}</span>}
        </div>
      </div>
    </header>
  );
};

export default Header;


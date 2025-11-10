// Ortak sayfa helper fonksiyonları

export const updatePageWithExcelStructure = (PageComponent, pageTitle, breadcrumb) => {
  // Bu fonksiyon sayfaları Excel yapısına göre günceller
  // Header bileşenini ekler ve Dashboard.css kullanır
  return (props) => {
    return (
      <div className="dashboard-page">
        <Header pageTitle={pageTitle} breadcrumb={breadcrumb} />
        <PageComponent {...props} />
      </div>
    );
  };
};

// Sayfa başlıkları ve breadcrumb'ları
export const PAGE_CONFIGS = {
  '/stok': {
    title: 'STOK RAPORU',
    breadcrumb: 'Anasayfa > Stok >'
  },
  '/stok/skt': {
    title: 'STOK RAPORU (SKT)',
    breadcrumb: 'Anasayfa > Stok > SKT >'
  },
  '/satis/marka': {
    title: 'SATIŞ RAPORU (Marka)',
    breadcrumb: 'Anasayfa > Satış > Marka >'
  },
  '/satis/kategori': {
    title: 'SATIŞ RAPORU (Kategori)',
    breadcrumb: 'Anasayfa > Satış > Kategori >'
  },
  '/satis/urun': {
    title: 'SATIŞ RAPORU (En Çok Satan)',
    breadcrumb: 'Anasayfa > Satış > En Çok Satan >'
  },
  '/satis/musteri': {
    title: 'SATIŞ RAPORU (Müşteri)',
    breadcrumb: 'Anasayfa > Satış > Müşteri >'
  },
  '/satis/kanal': {
    title: 'SATIŞ RAPORU (Satış Kanalı)',
    breadcrumb: 'Anasayfa > Satış > Satış Kanalı >'
  },
  '/alis/marka': {
    title: 'ALIŞ RAPORU (Marka)',
    breadcrumb: 'Anasayfa > Alış > Marka >'
  },
  '/alis/kategori': {
    title: 'ALIŞ RAPORU (Kategori)',
    breadcrumb: 'Anasayfa > Alış > Kategori >'
  },
  '/alis/urun': {
    title: 'ALIŞ RAPORU (En Çok Satan)',
    breadcrumb: 'Anasayfa > Alış > En Çok Satan >'
  },
  '/alis/musteri': {
    title: 'ALIŞ RAPORU (Müşteri)',
    breadcrumb: 'Anasayfa > Alış > Müşteri >'
  },
  '/alis/kanal': {
    title: 'ALIŞ RAPORU (Tedarikçi)',
    breadcrumb: 'Anasayfa > Alış > Tedarikçi >'
  }
};


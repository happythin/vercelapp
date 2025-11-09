# Stok Raporu - Veri Yapısı Rehberi

## Mevcut Durum

Şu anda Google Sheets'te veriler **aylık toplamlar** şeklinde tutuluyor:
- Her satır bir ürün/marka/kategori temsil ediyor
- Aylık veriler: OCAK, ŞUBAT, MART, NİSAN, MAYIS, HAZİRAN, TEMMUZ, AĞUSTOS, EYLÜL, EKİM, KASIM, ARALIK sütunlarında
- TOPLAM sütunu: Tüm ayların toplamı

## Günlük ve Haftalık Raporlar İçin Çözümler

### ✅ Seçenek 1: Mevcut Yapıyı Koruyarak (Yaklaşık Veriler)

**Avantajlar:**
- Mevcut verilerinizi değiştirmenize gerek yok
- Hemen kullanılabilir
- Basit ve pratik

**Nasıl Çalışır:**
- Günlük rapor: Son ayın günlük ortalaması (aylık toplam / ayın gün sayısı)
- Haftalık rapor: Son ayın haftalık ortalaması (aylık toplam / ayın gün sayısı × 7)

**Örnek:**
- Ocak ayı toplamı: 30,000 adet
- Ocak ayı 31 gün
- Son 1 gün tahmini: 30,000 / 31 ≈ 968 adet
- Son 1 hafta tahmini: (30,000 / 31) × 7 ≈ 6,774 adet

**Not:** Bu yaklaşık değerlerdir. Gerçek günlük/haftalık veriler için Seçenek 2'yi kullanın.

---

### 📅 Seçenek 2: Gerçek Günlük/Haftalık Veriler (Önerilen)

**Avantajlar:**
- Gerçek günlük ve haftalık veriler
- Daha detaylı analiz imkanı
- Tarih bazlı filtreleme

**Google Sheets Düzenlemesi:**

#### Adım 1: Yeni Sütun Ekleme

Mevcut yapınızı koruyarak, yeni bir sütun ekleyin:

1. Google Sheets'te en sağa yeni bir sütun ekleyin (örneğin: "Tarih" veya "Satış Tarihi")
2. Bu sütun formatı: `DD.MM.YYYY` veya `DD/MM/YYYY` veya `YYYY-MM-DD`

#### Adım 2: Veri Formatı

**Örnek 1: Mevcut Yapıyı Koruyarak (Önerilen)**

Mevcut satırlarınızı koruyun, sadece tarih sütunu ekleyin:

| Tip | Isim | TOPLAM | OCAK | ŞUBAT | ... | Tarih |
|-----|------|--------|------|-------|-----|-------|
| Ürün | Ürün A | 10000 | 800 | 900 | ... | 15.01.2024 |
| Ürün | Ürün B | 5000 | 400 | 500 | ... | 20.01.2024 |

**Örnek 2: Detaylı Satış Kayıtları (Daha Doğru)**

Her satışı ayrı satır olarak tutun:

| Tip | Isim | Adet | Tarih |
|-----|------|------|-------|
| Ürün | Ürün A | 50 | 15.01.2024 |
| Ürün | Ürün A | 30 | 16.01.2024 |
| Ürün | Ürün B | 25 | 15.01.2024 |
| Ürün | Ürün B | 40 | 17.01.2024 |

#### Adım 3: Tarih Formatı

Tarih sütununda şu formatlardan birini kullanın:
- `DD.MM.YYYY` (örn: 15.01.2024)
- `DD/MM/YYYY` (örn: 15/01/2024)
- `YYYY-MM-DD` (örn: 2024-01-15)

#### Adım 4: Kod Güncellemesi

Tarih sütunu eklendikten sonra, kod otomatik olarak tarih bazlı filtreleme yapacak şekilde güncellenecek.

---

## Hangi Seçeneği Seçmeliyim?

### Seçenek 1'i Seçin Eğer:
- ✅ Hızlı bir çözüm istiyorsanız
- ✅ Mevcut verilerinizi değiştirmek istemiyorsanız
- ✅ Yaklaşık değerler yeterliyse

### Seçenek 2'yi Seçin Eğer:
- ✅ Gerçek günlük/haftalık veriler istiyorsanız
- ✅ Detaylı analiz yapmak istiyorsanız
- ✅ Verilerinizi daha detaylı tutmak istiyorsanız

---

## Öneri

**Kısa vadede:** Seçenek 1 ile başlayın (kod zaten güncellendi)

**Uzun vadede:** Seçenek 2'ye geçiş yapın - Google Sheets'e "Tarih" sütunu ekleyin ve kod güncellemesi yapılacak.

---

## Sorularınız İçin

Tarih sütunu ekledikten sonra, kodun tarih bazlı filtreleme yapması için `sheetsService.js` ve `StokRaporu.js` dosyalarının güncellenmesi gerekecek. Bu güncellemeyi yapmak için bana haber verin!


# GitHub'a Yükleme Rehberi

## Adım 1: Tüm Değişiklikleri Stage'e Ekle

```bash
git add .
```

## Adım 2: Commit Yap

```bash
git commit -m "Raporla projesi - Vercel deploy için hazır"
```

## Adım 3: GitHub'da Repository Oluştur

1. https://github.com adresine gidin
2. Sağ üstteki **"+"** butonuna tıklayın
3. **"New repository"** seçin
4. Repository adını girin (örn: `raporla` veya `satis-raporlari`)
5. **Public** veya **Private** seçin
6. **"Create repository"** butonuna tıklayın
7. **ÖNEMLİ**: "Initialize this repository with a README" seçeneğini **işaretlemeyin** (zaten README var)

## Adım 4: GitHub Repository URL'ini Kopyala

Oluşturduğunuz repository sayfasında şu şekilde bir URL göreceksiniz:
```
https://github.com/KULLANICI_ADINIZ/REPO_ADI.git
```

## Adım 5: Remote Repository Ekle ve Push Yap

```bash
# Remote repository ekle (URL'yi kendi repository URL'inizle değiştirin)
git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADI.git

# Veya SSH kullanıyorsanız:
# git remote add origin git@github.com:KULLANICI_ADINIZ/REPO_ADI.git

# Değişiklikleri GitHub'a gönder
git push -u origin master
```

**Not**: Eğer `master` yerine `main` branch kullanıyorsanız:
```bash
git branch -M main
git push -u origin main
```

## Alternatif: GitHub Desktop Kullanarak

1. GitHub Desktop uygulamasını indirin: https://desktop.github.com
2. Uygulamayı açın ve GitHub hesabınıza giriş yapın
3. **File → Add Local Repository** seçin
4. Proje klasörünü seçin
5. **Publish repository** butonuna tıklayın

## Sorun Giderme

### Eğer "remote origin already exists" hatası alırsanız:
```bash
git remote remove origin
git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADI.git
```

### Eğer authentication hatası alırsanız:
- GitHub'da Personal Access Token oluşturun
- Veya GitHub Desktop kullanın
- Veya SSH key kullanın

### Eğer "master" branch hatası alırsanız:
```bash
git branch -M main
git push -u origin main
```


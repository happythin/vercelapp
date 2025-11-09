# GitHub'a Yükleme - Adım Adım

## ⚠️ ÖNEMLİ: Doğru Dizinde Olduğunuzdan Emin Olun

Komutları çalıştırmadan önce proje klasörüne gidin:

```bash
cd C:\Users\A\Desktop\Happy\React1\my-app
```

## Adım 1: Git Durumunu Kontrol Edin

```bash
git status
```

Bu komut çalışıyorsa, git repository hazır demektir.

## Adım 2: GitHub'da Repository Oluşturun

1. https://github.com → Giriş yapın
2. Sağ üstte **"+"** → **"New repository"**
3. Repository adı: `raporla` (veya istediğiniz isim)
4. **Public** veya **Private** seçin
5. **"Initialize with README" seçeneğini İŞARETLEMEYİN**
6. **"Create repository"** tıklayın

## Adım 3: Repository URL'ini Kopyalayın

Oluşturduğunuz repository sayfasında şu şekilde bir URL göreceksiniz:

```
https://github.com/KULLANICI_ADINIZ/raporla.git
```

## Adım 4: Remote Ekle ve Push Yap

**Kendi repository URL'inizi kullanın:**

```bash
# Remote ekle (URL'yi kendi repository URL'inizle değiştirin)
git remote add origin https://github.com/KULLANICI_ADINIZ/raporla.git

# Değişiklikleri GitHub'a gönder
git push -u origin master
```

**Eğer "master" yerine "main" kullanıyorsanız:**

```bash
git branch -M main
git push -u origin main
```

## Sorun Giderme

### "fatal: not a git repository" hatası alıyorsanız:

1. Doğru dizinde olduğunuzdan emin olun:
   ```bash
   cd C:\Users\A\Desktop\Happy\React1\my-app
   ```

2. Git repository'nin var olduğunu kontrol edin:
   ```bash
   dir .git
   ```
   (Bu komut `.git` klasörünü göstermeli)

3. Eğer `.git` klasörü yoksa:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

### "remote origin already exists" hatası alıyorsanız:

```bash
git remote remove origin
git remote add origin https://github.com/KULLANICI_ADINIZ/raporla.git
```

### Authentication hatası alıyorsanız:

GitHub'da Personal Access Token kullanmanız gerekebilir:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" → "repo" yetkilerini seçin
3. Token'ı kopyalayın
4. Push yaparken şifre yerine token kullanın

Veya GitHub Desktop kullanın: https://desktop.github.com


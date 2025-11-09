# Manuel Push Yapma

## Yöntem 1: Token'ı URL'ye Ekleyerek (Geçici)

PowerShell veya Command Prompt'ta şu komutu çalıştırın (TOKEN'ı kendi token'ınızla değiştirin):

```bash
git remote set-url origin https://TOKEN@github.com/happythin/vercelapp.git
git push -u origin main
```

**Örnek:**
```bash
git remote set-url origin https://ghp_xxxxxxxxxxxxx@github.com/happythin/vercelapp.git
git push -u origin main
```

**ÖNEMLİ**: Push başarılı olduktan sonra token'ı URL'den kaldırın:
```bash
git remote set-url origin https://github.com/happythin/vercelapp.git
```

## Yöntem 2: GitHub Desktop (En Kolay)

1. https://desktop.github.com adresinden GitHub Desktop'ı indirin
2. GitHub hesabınıza giriş yapın
3. **File → Add Local Repository**
4. Klasörü seçin: `C:\Users\A\Desktop\Happy\React1\my-app`
5. **Publish repository** butonuna tıklayın
6. Repository: `happythin/vercelapp` seçin
7. **Publish repository** tıklayın

## Yöntem 3: Command Prompt Kullanarak

PowerShell yerine Command Prompt (cmd.exe) kullanmayı deneyin:

1. Windows tuşu + R → `cmd` yazın → Enter
2. Şu komutları çalıştırın:

```bash
cd C:\Users\A\Desktop\Happy\React1\my-app
git push -u origin main
```

3. Username ve Password (token) sorulduğunda girin

## Yöntem 4: Git Bash Kullanarak

Git Bash kullanıyorsanız:

```bash
cd /c/Users/A/Desktop/Happy/React1/my-app
git push -u origin main
```


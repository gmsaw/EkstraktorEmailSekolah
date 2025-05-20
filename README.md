# Ekstraktor Email Sekolah

<p align="center">
  <img src="/src/img/frame1.png" width="200">
  <img src="/src/img/frame2.png" width="200"> 
</p>
  
![App Screenshot](/src/img/preview.png)  
*Tampilan aplikasi Ekstraktor Email Sekolah*

## 📝 Deskripsi

Ekstraktor Email Sekolah adalah tools berbasis web untuk mengekstrak alamat email sekolah dari database Kemdikbud menggunakan NPSN. Aplikasi ini sangat berguna untuk:

- Mendapatkan email valid sekolah negeri/swasta
- Memverifikasi data kontak sekolah
- Keperluan administrasi pendidikan

## ✨ Fitur Utama

- 📤 Upload file Excel (format .xlsx/.xls)
- 🔍 Ekstrak email otomatis dari database Kemdikbud
- 🔄 Opsi retry untuk data yang gagal
- 📥 Download hasil dalam format Excel
- 📊 Tampilan hasil dengan status ekstraksi
- 🚀 Proses cepat dengan progress indicator

## 🛠 Teknologi

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![SheetJS](https://img.shields.io/badge/SheetJS-217346?style=for-the-badge&logo=excel&logoColor=white)

## 🚀 Cara Menggunakan

### Persyaratan
- Browser modern (Chrome, Firefox, Edge terbaru)
- File Excel berisi kolom NPSN

### Langkah-langkah
1. **Upload File**  
   - Klik area upload atau drag & drop file Excel
   - Pastikan file berisi kolom NPSN

2. **Proses Data**  
   - Klik tombol "Mulai Proses"
   - Tunggu hingga proses selesai

3. **Download Hasil**  
   - Setelah selesai, klik "Download Hasil"
   - File Excel akan berisi data sekolah beserta email

## 📁 Struktur File

```
ekstraktor-email-sekolah/
├── public
    ├── index.html          # File utama aplikasi
    ├── script.js           # Logika utama aplikasi
    ├── styles.css          # File styling tambahan
└── README.md           
```

## 📜 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

Dibuat oleh [gmsaw](https://instagram.com/gmsaw_)  
⚠️ Disclaimer: Tools ini hanya untuk keperluan pendidikan dan menggunakan data referensi dari Kemdikbud.
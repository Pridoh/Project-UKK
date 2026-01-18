# 🚗 Parking Management System

> **Web-Based Parking Management & Analytics Application**  
> Built for malls, hospitals, and integrated parking areas

---

## 🇬🇧 English Version

### 📌 Project Overview
This project is a **Web-Based Parking Management System** designed to digitize and automate parking operations. It addresses common issues found in manual parking systems such as long queues, inaccurate transaction records, lack of real-time slot tracking, and limited reporting capabilities.

The system supports **multiple user roles** (Admin, Parking Staff, and Owner/Management) and is built with scalability in mind, allowing future integration with sensors, gates, and advanced analytics.

This project is developed as part of a **UKK (Uji Kompetensi Keahlian)** scenario for Software Engineering.

---

### 🧱 Tech Stack
- **Laravel 12** (Backend Framework)
- **Laravel Starter Kit with React** (Frontend Integration)
- **React** (UI Layer)
- **Tailwind CSS** (Styling & Design System)
- **MySQL** (Database)
- **Modular Monolith Architecture** (Code Organization)

---

### 🧩 Key Features
- Multi-role authentication (Admin, Parking Staff, Owner)
- Parking transaction management (check-in, check-out, payment)
- Automatic parking fee calculation based on duration & vehicle type
- Parking area & capacity management
- Member & non-member vehicle handling
- Receipt printing with QR Code
- Basic reports & occupancy overview
- Role-based access control (RBAC)

> ⚙️ Tier 2 and Tier 3 introduce advanced features such as real-time occupancy, dynamic pricing, analytics dashboards, and business intelligence.

---

### 🗂 Modular Monolith Folder Structure
This project uses a **Modular Monolith** approach to keep the codebase clean, scalable, and easy to maintain.

**Why Modular Monolith?**
- Clear separation of concerns per domain/module
- Easier to scale than a traditional monolith
- No overhead of microservices

**Example Structure:**

```
app/
└── Modules/
    ├── Auth/
    │   ├── Config/
    │   ├── Controllers/
    │   ├── Models/
    │   ├── Request/
    │   └── Enum/
    ├── Parking/
    │   ├── Controllers/
    │   ├── Models/
    │   ├── Services/
    │   └── Enum/
    ├── Reports/
    └── MasterData/
```

Each module is **self-contained**, including its own controllers, models, routes, and business logic.

---

### 🖼 Application Documentation (Screenshots)
> _This section will be updated with real screenshots of the application UI._

```
📷 /docs/screenshots/
   ├── login-page.png
   ├── dashboard-admin.png
   ├── parking-checkin.png
   ├── parking-checkout.png
   ├── reports.png
   └── occupancy-display.png
```

---

### 🚀 Future Improvements
- Integration with parking gate & camera (IoT simulation)
- Real-time occupancy dashboard (WebSocket / Polling)
- Dynamic & time-based pricing rules
- Advanced analytics & predictive insights
- Export reports to PDF / Excel
- Mobile-friendly optimization

---

### 👨‍💻 Author
Developed by **[Pridoh]**  
Role: Fullstack Developer (Laravel & React)

---

## 🇮🇩 Versi Bahasa Indonesia

### 📌 Deskripsi Proyek
Proyek ini adalah **Sistem Manajemen Parkir Berbasis Web** yang dirancang untuk mendigitalisasi dan mengotomatisasi proses parkir. Sistem ini bertujuan untuk mengatasi permasalahan parkir manual seperti antrean panjang, kesalahan pencatatan, keterbatasan monitoring slot parkir, dan laporan yang tidak akurat.

Aplikasi mendukung **beberapa peran pengguna** (Admin, Petugas Parkir, dan Owner/Manajemen) serta dirancang agar mudah dikembangkan ke fitur lanjutan seperti sensor parkir dan analitik bisnis.

Proyek ini dikembangkan sebagai bagian dari **UKK Rekayasa Perangkat Lunak**.

---

### 🧱 Tech Stack yang Digunakan
- **Laravel 12**
- **Laravel Starter Kit dengan React**
- **React**
- **Tailwind CSS**
- **MySQL**
- **Arsitektur Modular Monolith**

---

### 🧩 Fitur Utama
- Autentikasi multi-role (Admin, Petugas, Owner)
- Manajemen transaksi parkir (masuk & keluar)
- Perhitungan tarif parkir otomatis
- Manajemen area & kapasitas parkir
- Sistem member & non-member
- Cetak struk parkir dengan QR Code
- Laporan dasar & monitoring okupansi
- Pembatasan akses berbasis role

---

### 🗂 Struktur Folder Modular Monolith
Pendekatan **Modular Monolith** digunakan untuk menjaga kode tetap rapi, terstruktur, dan mudah dikembangkan.

**Keunggulan:**
- Pemisahan fitur berdasarkan domain
- Mudah dikembangkan & dipelihara
- Cocok untuk aplikasi skala menengah – besar

Setiap modul memiliki tanggung jawab sendiri dan tidak saling bercampur.

---

### 🖼 Dokumentasi Tampilan Aplikasi
> _Screenshot aplikasi akan ditambahkan pada bagian ini._

```
📷 /docs/screenshots/
```

---

### 🚀 Rencana Pengembangan
- Monitoring slot parkir real-time
- Sistem tarif dinamis
- Dashboard analitik & visualisasi data
- Export laporan (PDF / Excel)
- Integrasi perangkat parkir (simulasi)

---

### 👨‍💻 Pengembang
Dikembangkan oleh **[Pridoh]**  
Sebagai bagian dari proyek **UKK RPL – Sistem Parkir Berbasis Web**

---

⭐ _If you find this project helpful, feel free to give it a star on GitHub!_


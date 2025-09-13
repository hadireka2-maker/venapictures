-- Optional SQL-based mock seed matching the app's mock data
-- NOTE: The app already seeds automatically on first run.
-- You can run this after schema.sql if you prefer database-side seeding.

-- USERS
with src as (
  select jsonb '[
    {"id":"c1e1f2b4-a0f1-4a47-9c9c-2b2a6b2a0c1b","email":"admin@vena.pictures","password":"admin","fullName":"Andi Vena","role":"Admin","isApproved":true},
    {"id":"d2e2f3b5-b1f2-5b58-8d8d-3c3b7c3b1d2c","email":"member@vena.pictures","password":"member","fullName":"Rina Asisten","role":"Member","permissions":["Manajemen Klien","Proyek","Kalender","Perencana Media Sosial"],"isApproved":true}
  ]' as doc
)
insert into public.users(id, data)
select elem->>'id', elem from src, jsonb_array_elements(src.doc) as elem
on conflict (id) do update set data = excluded.data;

-- PROFILE
with src as (
  select jsonb '{
    "id": "prof-c1e1f2b4-a0f1-4a47-9c9",
    "adminUserId": "c1e1f2b4-a0f1-4a47-9c9c-2b2a6b2a0c1b",
    "fullName": "Andi Vena",
    "email": "admin@vena.pictures",
    "phone": "081288889999",
    "companyName": "Vena Pictures",
    "website": "https://venapictures.com",
    "address": "Jl. Kreatif No. 10, Jakarta Pusat",
    "bankAccount": "BCA - 9876543210 a/n Vena Pictures",
    "authorizedSigner": "Andi Vena",
    "idNumber": "3171234567890002",
    "bio": "Mengabadikan momen dengan sentuhan sinematik. Spesialis pernikahan dan prewedding di Vena Pictures.",
    "incomeCategories": ["DP Proyek","Pelunasan Proyek","Penjualan Cetak","Sewa Alat","Modal","Penjualan Add-on"],
    "expenseCategories": ["Gaji Freelancer","Transportasi","Akomodasi","Konsumsi","Peralatan","Marketing","Operasional Kantor","Sewa Tempat","Cetak Album","Penarikan Hadiah Freelancer","Transfer Internal","Penutupan Anggaran","Biaya Produksi Lain"],
    "projectTypes": ["Pernikahan","Lamaran","Prewedding","Korporat","Ulang Tahun","Produk","Keluarga"],
    "eventTypes": ["Meeting Klien","Survey Lokasi","Libur","Workshop","Acara Internal","Lainnya"],
    "assetCategories": ["Kamera","Lensa","Lighting","Komputer","Drone","Aksesoris","Lainnya"],
    "sopCategories": ["Pernikahan","Korporat","Umum","Editing","Prewedding"],
    "packageCategories": ["Pernikahan","Lamaran","Prewedding","Korporat","Ulang Tahun","Produk","Keluarga"],
    "projectStatusConfig": [
      {"id":"status_1","name":"Persiapan","color":"#6366f1","subStatuses":[{"name":"Briefing Internal","note":"Rapat tim internal untuk membahas konsep."},{"name":"Survey Lokasi","note":"Kunjungan ke lokasi acara jika diperlukan."}],"note":"Tahap awal persiapan proyek."},
      {"id":"status_2","name":"Dikonfirmasi","color":"#3b82f6","subStatuses":[{"name":"Pembayaran DP","note":"Menunggu konfirmasi pembayaran DP dari klien."},{"name":"Penjadwalan Tim","note":"Mengalokasikan freelancer untuk proyek."}],"note":"Proyek telah dikonfirmasi oleh klien."},
      {"id":"status_3","name":"Editing","color":"#8b5cf6","subStatuses":[{"name":"Seleksi Foto","note":"Proses pemilihan foto terbaik oleh tim atau klien."},{"name":"Color Grading Video","note":"Penyesuaian warna pada video."},{"name":"Music Scoring","note":"Pemilihan musik latar untuk video."}],"note":"Proses pasca-produksi."},
      {"id":"status_4","name":"Revisi","color":"#14b8a6","subStatuses":[],"note":"Tahap revisi berdasarkan masukan klien."},
      {"id":"status_5","name":"Cetak","color":"#f97316","subStatuses":[{"name":"Approval Desain Album","note":"Menunggu persetujuan final desain album dari klien."},{"name":"Proses Cetak","note":"Album dan foto sedang dalam proses pencetakan."},{"name":"QC Album","note":"Pemeriksaan kualitas hasil cetakan."}],"note":"Proses pencetakan output fisik."},
      {"id":"status_6","name":"Dikirim","color":"#06b6d4","subStatuses":[],"note":"Hasil akhir telah dikirim ke klien."},
      {"id":"status_7","name":"Selesai","color":"#10b981","subStatuses":[],"note":"Proyek telah selesai dan semua pembayaran lunas."},
      {"id":"status_8","name":"Dibatalkan","color":"#ef4444","subStatuses":[],"note":"Proyek dibatalkan oleh klien atau vendor."}
    ],
    "notificationSettings": {"newProject": true, "paymentConfirmation": true, "deadlineReminder": true},
    "securitySettings": {"twoFactorEnabled": false},
    "briefingTemplate": "Halo tim,\\nBerikut adalah briefing untuk acara besok.\\n\\nKey Persons:...",
    "termsAndConditions": "(ringkas)",
    "contractTemplate": "(ringkas)",
    "brandColor": "#3b82f6",
    "publicPageConfig": {"template":"classic","title":"Galeri & Paket Layanan Kami","introduction":"Lihat portofolio terbaru dan paket layanan yang kami tawarkan.","galleryImages":[]},
    "chatTemplates": []
  }' as doc
)
insert into public.profiles(id, data)
select src.doc->>'id', src.doc from src
on conflict (id) do update set data = excluded.data;

-- PACKAGES
with src as (
  select jsonb '[
    {"id":"PKG001","name":"Paket Pernikahan Silver","price":12000000,"category":"Pernikahan","physicalItems":[{"name":"Album Cetak Eksklusif 20x30cm 20 Halaman","price":850000},{"name":"Cetak Foto 16R + Bingkai Minimalis (2pcs)","price":400000}],"digitalItems":["Semua file foto (JPG) hasil seleksi","1 Video highlight (3-5 menit)"],"processingTime":"30 hari kerja","photographers":"2 Fotografer","videographers":"1 Videografer"},
    {"id":"PKG002","name":"Paket Pernikahan Gold","price":25000000,"category":"Pernikahan","physicalItems":[{"name":"Album Cetak Premium 25x30cm 30 Halaman","price":1500000},{"name":"Cetak Foto 20R + Bingkai Premium (2pcs)","price":750000},{"name":"Box Kayu Eksklusif + Flashdisk 64GB","price":500000}],"digitalItems":["Semua file foto (JPG) tanpa seleksi","1 Video sinematik (5-7 menit)","Video Teaser 1 menit untuk sosmed"],"processingTime":"45 hari kerja","photographers":"2 Fotografer","videographers":"2 Videografer"},
    {"id":"PKG003","name":"Paket Acara Korporat","price":8000000,"category":"Korporat","physicalItems":[],"digitalItems":["Dokumentasi foto (JPG)","1 Video dokumentasi (10-15 menit)"],"processingTime":"14 hari kerja","photographers":"1 Fotografer","videographers":"1 Videografer"},
    {"id":"PKG004","name":"Paket Lamaran","price":5000000,"category":"Lamaran","physicalItems":[],"digitalItems":["Semua file foto (JPG) hasil seleksi","1 Video highlight (1-2 menit)"],"processingTime":"14 hari kerja","photographers":"1 Fotografer"},
    {"id":"PKG005","name":"Paket Prewedding","price":6500000,"category":"Prewedding","physicalItems":[{"name":"Cetak Foto Kanvas 40x60cm","price":600000}],"digitalItems":["50 foto edit high-resolution","1 video sinematik 1 menit"],"processingTime":"21 hari kerja","photographers":"1 Fotografer","videographers":"1 Videografer"},
    {"id":"PKG006","name":"Sesi Foto Keluarga","price":3500000,"category":"Keluarga","physicalItems":[{"name":"Cetak Foto 10R + Bingkai (5pcs)","price":350000}],"digitalItems":["25 foto edit high-resolution"],"processingTime":"10 hari kerja","photographers":"1 Fotografer"}
  ]' as doc
)
insert into public.packages(id, data)
select elem->>'id', elem from src, jsonb_array_elements(src.doc) as elem
on conflict (id) do update set data = excluded.data;

-- ADD ONS
with src as (
  select jsonb '[
    {"id":"ADDON001","name":"Same Day Edit Video","price":2500000},
    {"id":"ADDON002","name":"Aerial Drone Shot","price":1500000},
    {"id":"ADDON003","name":"Jasa MUA Profesional","price":1000000},
    {"id":"ADDON004","name":"Album Tambahan untuk Orang Tua","price":1200000}
  ]' as doc
)
insert into public.add_ons(id, data)
select elem->>'id', elem from src, jsonb_array_elements(src.doc) as elem
on conflict (id) do update set data = excluded.data;

-- CARDS
with src as (
  select jsonb '[
    {"id":"CARD001","cardHolderName":"Andi Vena","bankName":"BCA","cardType":"Debit","lastFourDigits":"3090","expiryDate":"09/28","balance":52500000,"colorGradient":"from-blue-500 to-sky-400"},
    {"id":"CARD002","cardHolderName":"Andi Vena","bankName":"Mandiri","cardType":"Kredit","lastFourDigits":"1121","expiryDate":"11/27","balance":-2500000,"colorGradient":"from-yellow-400 to-amber-500"},
    {"id":"CARD_CASH_001","cardHolderName":"Kas Operasional","bankName":"Tunai","cardType":"Tunai","lastFourDigits":"CASH","balance":5000000,"colorGradient":"from-slate-100 to-slate-300"}
  ]' as doc
)
insert into public.cards(id, data)
select elem->>'id', elem from src, jsonb_array_elements(src.doc) as elem
on conflict (id) do update set data = excluded.data;

-- CLIENTS (subset)
with src as (
  select jsonb '[
    {"id":"CLI001","name":"Budi & Sinta","email":"budi.sinta@example.com","phone":"081234567890","whatsapp":"6281234567890","since":"2023-01-15","instagram":"@budisinta.wedding","status":"Aktif","clientType":"Langsung","lastContact":"2024-05-20T10:00:00Z","portalAccessId":"portal-budi-sinta"},
    {"id":"CLI002","name":"PT Sejahtera Abadi","email":"hrd@sejahteraabadi.com","phone":"021-555-1234","since":"2023-03-22","status":"Aktif","clientType":"Langsung","lastContact":"2024-07-10T14:00:00Z","portalAccessId":"portal-sejahtera-abadi"}
  ]' as doc
)
insert into public.clients(id, data)
select elem->>'id', elem from src, jsonb_array_elements(src.doc) as elem
on conflict (id) do update set data = excluded.data;

-- You can continue similarly to insert projects, transactions, team members, pockets, leads, notifications, sops, promo_codes, social_media_posts, assets, client_feedback, contracts, team_project_payments, team_payment_records, reward_ledger_entries using jsonb_array_elements.
-- The app will still seed everything if tables are empty.


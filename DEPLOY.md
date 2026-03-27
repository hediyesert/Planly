# Planly Canliya Alma Rehberi

Bu projeyi en pratik sekilde su kombinasyonla canliya alabilirsin:

- Backend: Render (Web Service)
- Frontend: Vercel (Static React)
- Veritabani: MongoDB Atlas (zaten kullaniyorsun)

## 1) Backend (Render)

1. Render'da yeni bir **Web Service** olustur ve repo'yu bagla.
2. Ayarlar:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Environment Variables:
   - `PORT=5001`
   - `MONGO_URI=...`
   - `GEMINI_API_KEY=...`
   - `JWT_SECRET=...`
4. Deploy et.
5. Cikan backend URL'ini not al:
   - Ornek: `https://planly-backend.onrender.com`

## 2) Frontend (Vercel)

1. Vercel'de repo'yu import et.
2. Root Directory: `frontend`
3. Build ayarlari:
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Environment Variables:
   - `REACT_APP_API_BASE_URL=https://planly-backend.onrender.com`
5. Deploy et.

## 3) CORS Notu

Backend'de su an `cors()` acik oldugu icin Vercel domain'inden istek alir.
Istersen daha guvenli yapmak icin sadece kendi frontend domain'ini whitelist edebilirsin.

## 4) Kontrol Listesi

- Kayit ve giris calisiyor mu?
- Program olusturma ve geri yukleme calisiyor mu?
- Tikler cikis-giris sonrasi korunuyor mu?
- Canli oda durumlari arkadas bazli gorunuyor mu?
- Haftalik analizde sure ve gorev verileri gorunuyor mu?


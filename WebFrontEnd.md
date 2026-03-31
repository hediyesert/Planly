# Web Frontend Görev Dağılımı

**Web Frontend Adresi:** [frontend.yazmuh.com](https://planly-subx.vercel.app)

---


**Front-end Test Videosu:** [Link buraya eklenecek](https://example.com)


---

## 1. Giriş Yapma (Login) Sayfası
- **API Endpoint:** `POST /auth/login`
- **Görev:** Mevcut kullanıcıların sisteme erişimi için kimlik doğrulama arayüzü.
- **UI Bileşenleri:**
  - Responsive giriş formu (Merkezi kart tasarımı).
  - Email input alanı (`type="email"`, `placeholder="E-posta adresiniz"`).
  - Şifre input alanı (`type="password"`, şifre göster/gizle ikonu).
  - "Giriş Yap" butonu (Yükleme durumunda *loading spinner* ile).
  - "Hesabınız yok mu? Kayıt Ol" yönlendirme linki.
- **Form Validasyonu:**
  - Email formatı doğrulaması (Regex).
  - Zorunlu alan kontrolü (Alanlar boşken buton etkisizleştirme).
  - API'den dönen 401 (Hatalı bilgiler) hatası için "Hatalı e-posta veya şifre" uyarısı.
- **Teknik Detaylar:**
  - Başarılı giriş sonrası **JWT Token**'ın `localStorage` üzerinde saklanması.
  - Global state (Context API/Zustand) üzerinden `isAuthenticated` durumunun güncellenmesi.

---

## 2. Üye Olma (Register) Sayfası
- **API Endpoint:** `POST /auth/register`
- **Görev:** Yeni kullanıcıların sisteme kayıt olması için gerekli form yapısı.
- **UI Bileşenleri:**
  - Ad ve Soyad input alanları.
  - Email ve Şifre belirleme alanları.
  - Şifre tekrar doğrulama alanı.
  - "Kayıt Ol" butonu.
- **Form Validasyonu:**
  - Şifre uzunluğu kontrolü (Minimum 8 karakter).
  - Şifrelerin birbiriyle eşleşme kontrolü.
  - API'den dönen 409 (Conflict) hatası için "Bu e-posta adresi zaten kullanımda" uyarısı.
- **Kullanıcı Deneyimi:**
  - Kayıt başarılı olduğunda kullanıcıyı otomatik olarak Login sayfasına yönlendirme.
  - Gerçek zamanlı (onBlur) validasyon geri bildirimleri.

---

## 3. Sınav Türü ve Konu Seçimi
- **API Endpoints:** `GET /exam-types`, `GET /exam-types/{examTypeId}/topics`
- **Görev:** Kullanıcının hedef sınavını seçmesi ve çalışmak istediği konuları belirlemesi.
- **UI Bileşenleri:**
  - Sınav türleri için interaktif kartlar (KPSS, YKS vb.).
  - Konu listesi için `Checkbox` yapısı.
  - Konu başlıkları arasında arama yapmak için `Search Bar`.
  - Seçilen toplam konu sayısını gösteren sabit bir "Özet Paneli".
- **Kullanıcı Deneyimi:**
  - Konular yüklenirken **Skeleton Screen** kullanımı.
  - Sınav türü değiştirildiğinde konu listesinin dinamik olarak güncellenmesi.
- **Teknik Detaylar:**
  - Seçilen konuların bir dizi (`selectedTopicIds[]`) olarak state'de tutulması.

---

## 4. AI Çalışma Programı Üretme
- **API Endpoint:** `POST /study-plans/ai-generate`
- **Görev:** Kullanıcı seçimlerini yapay zekaya göndererek kişiselleştirilmiş takvim oluşturma.
- **UI Bileşenleri:**
  - Hedef tarih seçici (Kalender input).
  - Günlük çalışma saati sınırı için `Slider` veya `Dropdown`.
  - "AI Programı Oluştur" butonu.
- **Kullanıcı Deneyimi:**
  - AI işlem yaparken kullanıcıya "Programınız yapay zeka tarafından optimize ediliyor..." mesajı ve animasyon gösterimi.
  - Oluşturulan programın haftalık takvim (Calendar View) üzerinde önizlemesi.
- **Teknik Detaylar:**
  - API'den dönen JSON takvim verisinin okunabilir bir liste yapısına dönüştürülmesi.

---

## 5. Çalışma Oturumu (Session) Yönetimi
- **API Endpoints:** `POST /study-sessions/start`, `PUT /study-sessions/{sessionId}/status`, `PUT /study-sessions/{sessionId}/finish`
- **Görev:** Aktif ders çalışma süresinin takibi ve kaydedilmesi.
- **UI Bileşenleri:**
  - Dijital sayaç (Timer/Chronometer).
  - "Duraklat" ve "Bitir" butonları.
  - O an çalışılan konunun görsel vurgusu.
- **Kullanıcı Deneyimi:**
  - Sayfa yenilense bile sayacın kaldığı yerden devam etmesi (**Persistence**).
  - Çalışma bittiğinde özet ekranı (Harcanan süre, tamamlanan konular).
- **Teknik Detaylar:**
  - Tarayıcı sekme başlığında (Title) kalan sürenin canlı olarak gösterilmesi.

---

## 6. Görev Tamamlama ve İlerleme Takibi
- **API Endpoint:** `PUT /tasks/{taskId}/complete`
- **Görev:** Programdaki maddelerin işaretlenmesi ve genel ilerleme durumu.
- **UI Bileşenleri:**
  - Dinamik **Progress Bar** (Yüzdelik ilerleme göstergesi).
  - Tamamlanan görevler için "Strike-through" (üstü çizili) yazı stili.
  - Başarı rozetleri veya motivasyon ikonları.
- **Kullanıcı Deneyimi:**
  - **Optimistic UI:** Kullanıcı check attığında API cevabı gelmeden arayüzün anlık güncellenmesi.
- **Teknik Detaylar:**
  - Genel ilerleme yüzdesinin otomatik hesaplanması.

---

## 7. Hesap Yönetimi ve Silme
- **API Endpoint:** `DELETE /users/{userId}`
- **Görev:** Kullanıcı profilinin yönetilmesi ve kalıcı olarak silinmesi.
- **UI Bileşenleri:**
  - Profil düzenleme formu.
  - "Hesabı Sil" butonu (Danger zone - kırmızı stil).
  - Silme işlemi öncesi çift onay mekanizması (Confirmation Modal).
- **Kullanıcı Deneyimi:**
  - Hesap silindiğinde tüm yerel verilerin (`localStorage`) temizlenmesi.
  - Kullanıcının ana sayfaya yönlendirilmesi.





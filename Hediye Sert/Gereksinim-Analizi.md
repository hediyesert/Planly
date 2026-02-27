1. **Üye Olma**
   - **API Metodu:** `POST/auth/register`
   - **Açıklama:** Kullanıcıların yeni hesaplar oluşturarak sisteme kayıt olmasını sağlar. Kişisel bilgilerin toplanmasını ve hesap oluşturma işlemlerini içerir. Kullanıcılar email adresi ve şifre belirleyerek hesap oluşturur.

2. **Giriş Yapma**
   - **API Metodu:** `POST/auth/login`
   - **Açıklama:** Kullanıcıların sistemdeki hesaplarına giriş yapmasını sağlar. Email ve şifre bilgileri doğrulanır. Başarılı giriş sonrası kullanıcıya yetkilendirme için bir erişim belirteci (token) oluşturulur.

3. **Sınav Türü Listeleme**
   - **API Metodu:** `GET/exam-types`
   - **Açıklama:** Sistemde tanımlı olan sınav türlerinin listesini getirir. Kullanıcılar hangi sınav türleri üzerinden çalışabileceklerini bu liste aracılığıyla görüntüler.

4. **Konuları Getirme**
   - **API Metodu:** `GET/exam-types/{examTypeId}/topics`
   - **Açıklama:** Seçilen sınav türüne ait konu listesini getirir. Kullanıcılar çalışma planı oluştururken bu konular arasından seçim yapabilir.
  
5. **AI Program Üretme**
   - **API Metodu:** `POST/study-plans/ai-generate`
   - **Açıklama:** Kullanıcının seçtiği sınav türü, konular ve hedeflere göre yapay zeka destekli bir çalışma programı oluşturur. Oluşturulan program kullanıcıya özel olarak planlanır.
  
6. **Çalışmayı Başlatma**
   - **API Metodu:** `POST/study-sessions/start`
   - **Açıklama:** Kullanıcının oluşturulan çalışma programı üzerinden bir çalışmayı başlatmasını sağlar. Çalışma durumu aktif olarak işaretlenir ve başlangıç zamanı kaydedilir.
  
7. **Çalışma Durumu Güncelleme**
   - **API Metodu:** `PUT/study-sessions/{sessionId}/status`
   -  **Açıklama:** Kullanıcının devam eden çalışmasının durumunu güncellemesini sağlar. Çalışma durumu “devam ediyor”, “duraklatıldı” gibi durumlara çekilebilir.
  
8. **Görev Tamamlama** 
   - **API Metodu:** `PUT/tasks/{taskId}/complete`
   - **Açıklama:** Çalışma programı içerisindeki bir görevin tamamlandığını işaretler. Tamamlanan görevler kullanıcı ilerleme durumuna yansıtılır.        

9. **Çalışmayı Bitirme**
   - **API Metodu:** `PUT/study-sessions/{sessionId}/finish`
   - **Açıklama:** Kullanıcının başlattığı çalışmayı tamamlamasını sağlar. Çalışma süresi ve tamamlanma durumu kaydedilir.
  
10. **Hesap Silme** 
   - **API Metodu:** `DELETE/users/{userId}`
   - **Açıklama:** Kullanıcının hesabını sistemden kalıcı olarak silmesini sağlar. Bu işlem geri alınamaz ve kullanıcıya ait tüm veriler silinir.     

# REST API Görev Dağılımı

**REST API Adresi:** [api.planly.com](https://planly-gamma.vercel.app)

---

**Rest API Test Videosu:** [Rest API Youtube Videosu](https://youtu.be/zNCi-PGVzd0)

---

## 1. Üye Olma
- **Endpoint:** `POST /auth/register`
- **Açıklama:** Yeni kullanıcı hesabı oluşturur.
- **Request Body:**
  ```json
  {
    "email": "kullanici@example.com",
    "password": "Guvenli123!",
    "firstName": "Ahmet",
    "lastName": "Yılmaz"
  }

## 2. Giriş Yapma
- **Endpoint:** `POST /auth/login`  

- **Açıklama:** Kullanıcı bilgilerini doğrular ve JWT Token döner.

- **Request Body:**
```json
{
  "email": "kullanici@example.com",
  "password": "Guvenli123!"
}

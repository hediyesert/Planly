# 1. Altyapı: Projemiz Node.js tabanlı olduğu için resmi Node imajını çekiyoruz
# alpine sürümü, gereksiz dosyalardan arındırılmış çok hafif ve hızlı bir sürümdür.
FROM node:18-alpine

# 2. Çalışma Alanı: Kapsayıcı içinde dosyalarımızın duracağı klasörü belirliyoruz
WORKDIR /app

# 3. Paket Dosyalarını Kopyalama: Önce sadece package.json dosyalarını alıyoruz
COPY package*.json ./

# 4. Bağımlılıkları Kurma: Gerekli tüm paketleri (express, mongoose vs.) kapsayıcıya indiriyoruz
RUN npm install

# 5. Proje Dosyalarını Kopyalama: Geri kalan tüm kodlarımızı kapsayıcının içine aktarıyoruz
COPY . .

# 6. Dışa Açılan Port: Senin Macbook'undaki çakışmayı önlemek için kullandığımız 5001 portunu açıyoruz
EXPOSE 5001

# 7. Çalıştırma Komutu: Kapsayıcı ayağa kalktığında sunucumuzu başlatacak komut
CMD ["node", "server.js"]
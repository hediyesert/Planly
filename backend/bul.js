// bul.js
async function modelleriGoster() {
  // Buraya o çalışan YENİ şifreni yapıştır (Tırnakları silmeden!)
  const apiKey = "AIzaSyAOdmvtePH3IdG42ZbM5IljGaiBb4_EwZ0"; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log("🎉 Google'ın Sana İzin Verdiği Modeller:");
      data.models.forEach(m => {
        // Sadece içerik üretebilen modelleri filtreleyelim
        if (m.supportedGenerationMethods.includes("generateContent")) {
            console.log("👉", m.name.replace('models/', ''));
        }
      });
    } else {
      console.log("Bir şeyler ters gitti:", data);
    }
  } catch (error) {
    console.error("Bağlantı kurulamadı:", error.message);
  }
}

modelleriGoster();
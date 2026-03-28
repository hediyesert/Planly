const Plan = require('../models/Plan');

// Yeni bir plan oluşturma (POST isteği)
const createPlan = async (req, res) => {
  try {
    const { examType, topics, studyTime } = req.body;

    // Basit bir doğrulama kontrolü
    if (!examType || !topics || !studyTime) {
      return res.status(400).json({ message: 'Lütfen sınav türü, konular ve süre alanlarını eksiksiz doldurun.' });
    }

    // Veritabanı modeline uygun yeni bir nesne yaratıyoruz
    const newPlan = new Plan({
      examType,
      topics,
      studyTime
    });

    // Veritabanına kaydetme işlemi
    const savedPlan = await newPlan.save();
    
    // Başarılı olursa 201 (Created) durumuyla veriyi geri dönüyoruz
    res.status(201).json(savedPlan);
  } catch (error) {
    res.status(500).json({ message: 'Plan oluşturulurken hata meydana geldi.', error: error.message });
  }
};

// Tüm planları getirme (GET isteği)
const getPlans = async (req, res) => {
  try {
    // Veritabanındaki tüm planları en yeniden en eskiye doğru (createdAt: -1) sıralayarak çekiyoruz
    const plans = await Plan.find().sort({ createdAt: -1 });
    
    // Başarılı olursa 200 (OK) durumuyla verileri geri dönüyoruz
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Planlar getirilirken hata meydana geldi.', error: error.message });
  }
};

// Plan güncelleme (PUT isteği)
const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    // Verilen ID'ye göre planı bul ve kullanıcının gönderdiği yeni verilerle (req.body) güncelle
    const updatedPlan = await Plan.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedPlan) {
      return res.status(404).json({ message: 'Güncellenecek plan bulunamadı.' });
    }
    
    res.status(200).json(updatedPlan);
  } catch (error) {
    res.status(500).json({ message: 'Plan güncellenirken hata oluştu.', error: error.message });
  }
};

// Plan silme (DELETE isteği)
const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    // Verilen ID'ye göre planı bul ve sil
    const deletedPlan = await Plan.findByIdAndDelete(id);
    
    if (!deletedPlan) {
      return res.status(404).json({ message: 'Silinecek plan bulunamadı.' });
    }
    
    res.status(200).json({ message: 'Plan başarıyla silindi.', deletedPlan });
  } catch (error) {
    res.status(500).json({ message: 'Plan silinirken hata oluştu.', error: error.message });
  }
};

module.exports = {
  createPlan,
  getPlans,
  updatePlan,
  deletePlan
};
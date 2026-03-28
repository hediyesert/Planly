const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  examType: {
    type: String,
    required: true, // Bu alanın doldurulması zorunlu
    trim: true
  },
  topics: {
    type: [String], // Birden fazla konu olabileceği için metinlerden oluşan bir dizi (array)
    required: true
  },
  studyTime: {
    type: Number, // Günlük veya haftalık ayrılacak süre (saat cinsinden)
    required: true
  },
  schedule: {
    type: Object, // Üretilen çalışma programının detayları
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now // Planın ne zaman oluşturulduğunu otomatik kaydeder
  }
});

// Şemayı modele çevirip dışa aktarıyoruz
module.exports = mongoose.model('Plan', planSchema);
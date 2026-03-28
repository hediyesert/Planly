const express = require('express');
const router = express.Router();
const { createPlan, getPlans, updatePlan, deletePlan } = require('../controllers/planController');

router.post('/', createPlan);
router.get('/', getPlans);

// Güncelleme ve silme işlemleri belirli bir ID üzerinden yapılacağı için rotaya /:id ekliyoruz
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

module.exports = router;
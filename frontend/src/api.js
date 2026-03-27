import axios from 'axios';
import { apiUrl } from './config';

// Backend Docker üzerinde 5001 portunda çalıştığı için ana adresimiz bu:
const API = axios.create({ baseURL: apiUrl('/api/plans') });

// Backend'den tüm planları getiren fonksiyon
export const fetchPlans = () => API.get('/');

// Yeni bir plan oluşturan fonksiyon
export const createPlan = (newPlan) => API.post('/', newPlan);

// Plan silme fonksiyonu
export const deletePlan = (id) => API.delete(`/${id}`);
import axios from 'axios';

// Detect host to dynamically configure the API endpoint
const getBaseURL = () => {
  // If running locally in development, default to port 5000
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api/';
  }
  // Otherwise, default to production endpoint or fallback relative to host
  return 'https://candidate-shortlisti.onrender.com/api/';
};

const API = axios.create({
  baseURL: getBaseURL()
});

// Request interceptor to automatically add the Authorization Bearer Token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for error logger
API.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response) {
      console.error(`❌ API Error (${error.response.status}):`, error.response.data);
      // Auto logout if unauthorized (token expired/invalid)
      if (error.response.status === 401 && !error.config.url.includes('auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-change'));
      }
    } else if (error.request) {
      console.error('❌ API Error: No response received.');
    } else {
      console.error('❌ API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const loginUser = (data) => API.post('auth/login', data);
export const signupUser = (data) => API.post('auth/signup', data);

// Complaint APIs
export const addComplaint = (data) => API.post('complaints', data);
export const getComplaints = (category = '') => API.get(`complaints${category ? `?category=${category}` : ''}`);
export const getComplaintById = (id) => API.get(`complaints/${id}`);
export const searchComplaintsByLocation = (location = '') => API.get(`complaints/search?location=${location}`);
export const updateComplaintStatus = (id, status) => API.put(`complaints/${id}`, { status });
export const deleteComplaint = (id) => API.delete(`complaints/${id}`);

// AI APIs
export const analyzeComplaint = (data) => API.post('ai/analyze', data);

export default API;

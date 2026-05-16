import axios from 'axios';

const API = axios.create({
  // Use trailing slash to ensure relative paths append correctly
  baseURL: 'https://candidate-shortlisti.onrender.com/api/'
  // baseURL: 'http://localhost:5000/api/'
});

// Debug interceptor to see exactly what URL is being hit
API.interceptors.request.use((config) => {
  console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for error logging
API.interceptors.response.use((response) => response, (error) => {
  if (error.response) {
    console.error(`❌ API Error (${error.response.status}):`, error.response.data);
  } else if (error.request) {
    console.error('❌ API Error: No response received. Possible CORS issue or wrong URL.');
  } else {
    console.error('❌ API Error:', error.message);
  }
  return Promise.reject(error);
});

// Candidate APIs - Removed leading slashes
export const addCandidate = (data) => API.post('candidates', data);
export const getCandidates = (search = '') => API.get(`candidates${search ? `?search=${search}` : ''}`);
export const deleteCandidate = (id) => API.delete(`candidates/${id}`);

// Match API
export const matchCandidates = (data) => API.post('match', data);

// AI APIs
export const aiShortlist = (data) => API.post('ai/shortlist', data);
export const aiInterviewQuestions = (data) => API.post('ai/interview-questions', data);

export default API;

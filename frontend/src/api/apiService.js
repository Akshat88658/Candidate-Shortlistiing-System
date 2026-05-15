import axios from 'axios';

const API = axios.create({
  baseURL: 'https://candidate-shortlisting.onrender.com/api'
});

// Candidate APIs
export const addCandidate = (data) => API.post('/candidates', data);
export const getCandidates = (search = '') => API.get(`/candidates${search ? `?search=${search}` : ''}`);
export const deleteCandidate = (id) => API.delete(`/candidates/${id}`);

// Match API
export const matchCandidates = (data) => API.post('/match', data);

// AI APIs
export const aiShortlist = (data) => API.post('/ai/shortlist', data);
export const aiInterviewQuestions = (data) => API.post('/ai/interview-questions', data);

export default API;

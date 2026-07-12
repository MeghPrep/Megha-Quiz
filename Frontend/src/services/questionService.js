import api from "../api/axios";

export function getQuestions() {
  return api.get(`/question`);
}

export function getQuestion(id) {
  return api.get(`/question/${id}`);
}

export function createQuestion(data) {
  return api.post(`/question`, data);
}

export function updateQuestion(id, data) {
  return api.put(`/question/${id}`, data);
}

export function deleteQuestion(id) {
  return api.delete(`/question/${id}`);
}

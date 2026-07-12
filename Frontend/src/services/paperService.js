import api from "../api/axios";

export function getPapers() {
  return api.get(`/paper`);
}

export function getPaper(id) {
  return api.get(`/paper/${id}`);
}

export function createPaper(data) {
  return api.post(`/paper`, data);
}

export function updatePaper(id, data) {
  return api.put(`/paper/${id}`, data);
}

export function deletePaper(id) {
  return api.delete(`/paper/${id}`);
}

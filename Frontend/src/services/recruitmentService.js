import api from "../api/axios";

export function getRecruitments() {
  return api.get(`/recruitment`);
}
export function getRecruitment(id) {
  return api.get(`/recruitment/${id}`);
}
export function createRecruitment(data) {
  return api.post(`/recruitment`, data);
}

export function updateRecruitment(id, data) {
  return api.put(`/recruitment/${id}`, data);
}

export function deleteRecruitment(id) {
  return api.delete(`/recruitment/${id}`);
}

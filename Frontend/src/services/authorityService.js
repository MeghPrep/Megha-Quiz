import api from "../api/axios";

export function getAuthorities() {
  return api.get("/authority");
}

export function getAuthority(id) {
  return api.get(`/authority/${id}`);
}

export function createAuthority(data) {
  return api.post("/authority", data);
}

export function updateAuthority(id, data) {
  return api.put(`/authority/${id}`, data);
}

export function deleteAuthority(id) {
  return api.delete(`/authority/${id}`);
}

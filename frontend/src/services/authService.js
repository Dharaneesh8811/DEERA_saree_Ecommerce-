import api from "./api";

export async function loginAdmin(email, password) {
  const response = await api.post("/api/admin/auth/login", {
    email,
    password,
  });

  return response.data;
}

export async function getCurrentAdmin() {
  const response = await api.get("/api/admin/auth/me");

  return response.data;
}
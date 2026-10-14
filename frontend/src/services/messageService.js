import api from "./api";

export async function getAdminMessages({ query = "", status = "" } = {}) {
  const params = {};
  if (query.trim()) params.query = query.trim();
  if (status) params.status = status;

  const response = await api.get("/api/admin/messages", { params });
  return response.data;
}

export async function getAdminMessagesPage({
  query = "",
  status = "",
  offset = 0,
  limit = 10,
} = {}) {
  const params = { offset, limit };
  if (query.trim()) params.query = query.trim();
  if (status) params.status = status;

  const response = await api.get("/api/admin/messages/page", { params });
  return response.data;
}

export async function getAdminMessage(messageId) {
  const response = await api.get(`/api/admin/messages/${messageId}`);
  return response.data;
}

export async function updateAdminMessageStatus(messageId, status) {
  const response = await api.patch(
    `/api/admin/messages/${messageId}/status`,
    { status }
  );
  return response.data;
}

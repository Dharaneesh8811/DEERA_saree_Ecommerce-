import api from "./api";

export async function getAdminBulkOrdersPage({ offset = 0, limit = 10 } = {}) {
  const response = await api.get("/api/admin/bulk-orders/page", {
    params: { offset, limit },
  });
  return response.data;
}

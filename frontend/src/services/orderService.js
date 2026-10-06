import api from "./api";

export async function createOrder(orderData) {
  const response = await api.post("/api/orders/", orderData);

  return response.data;
}

export async function getAdminOrders() {
  const response = await api.get("/api/admin/orders");

  return response.data;
}

export async function getAdminOrder(orderId) {
  const response = await api.get(`/api/admin/orders/${orderId}`);

  return response.data;
}

export async function getOrder(orderId) {
  const response = await api.get(`/api/orders/${orderId}`);

  return response.data;
}

const orderStatuses = ["placed", "under_review", "confirmed", "shipped"];

export async function updateOrderStatus(orderId, status) {
  if (!orderStatuses.includes(status)) {
    throw new Error(`Unsupported order status: ${status}`);
  }

  const response = await api.patch(`/api/orders/${orderId}/status`, {
    status,
  });

  return response.data;
}

export async function updateOrderItems(orderId, items) {
  const response = await api.patch(`/api/orders/${orderId}/items`, {
    items,
  });

  return response.data;
}

export async function getOrdersByPhone(phone) {
  const response = await api.get(`/api/orders/phone/${phone}`);
  return response.data;
}
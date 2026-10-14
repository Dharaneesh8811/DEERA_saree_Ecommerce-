
import api from "./api";

export async function createOrder(orderData) {
  const response = await api.post("/api/orders/", orderData);
  return response.data;
}

export async function getAdminOrders() {
  const response = await api.get("/api/admin/orders");
  return response.data;
}

export async function getAdminOrdersPage({ offset = 0, limit = 10 } = {}) {
  const response = await api.get("/api/admin/orders/page", {
    params: { offset, limit },
  });
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

export async function trackOrder(orderNumber, phone) {
  const response = await api.post("/api/orders/track", {
    order_number: orderNumber.trim(),
    phone: phone.trim(),
  });

  return response.data;
}

const orderStatuses = [
  "placed",
  "under_review",
  "confirmed",
  "shipped",
];

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

export async function getOrderByNumber(orderId) {
  const value = orderId.trim();

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value
    );

  if (isUuid) {
    return getOrder(value);
  }

  if (!/^DEERA ORDER-\d+$/i.test(value)) {
    throw new Error("Enter DEERA ORDER-XXX or a valid order UUID.");
  }

  const response = await api.get(
    `/api/orders/reference/${encodeURIComponent(value)}`
  );

  return response.data;
}

export async function getOrdersByPhone(phone) {
  const value = phone.trim();

  if (!/^[6-9]\d{9}$/.test(value)) {
    throw new Error("Enter a valid 10-digit Indian mobile number.");
  }

  const response = await api.get(
    `/api/orders/phone/${encodeURIComponent(value)}`
  );

  return response.data;
}

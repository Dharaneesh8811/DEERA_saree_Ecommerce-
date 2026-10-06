import api from "./api";

export async function getCoupons() {
  const response = await api.get("/api/coupons/");
  return response.data;
}

export async function getCoupon(couponId) {
  const response = await api.get(`/api/coupons/${couponId}`);
  return response.data;
}

export async function createCoupon(couponData) {
  const response = await api.post("/api/coupons/", couponData);
  return response.data;
}

export async function updateCoupon(couponId, couponData) {
  const response = await api.patch(
    `/api/coupons/${couponId}`,
    couponData
  );
  return response.data;
}

export async function deleteCoupon(couponId) {
  const response = await api.delete(
    `/api/coupons/${couponId}`
  );
  return response.data;
}

export async function applyCoupon(code, orderAmount) {
  const response = await api.post("/api/coupons/apply", {
    code,
    order_amount: orderAmount,
  });

  return response.data;
}
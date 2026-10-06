import api from "./api";

export async function getProductReviews(productId) {
  const response = await api.get(`/api/reviews/product/${productId}`);

  return response.data;
}

export async function createProductReview(reviewData) {
  const response = await api.post("/api/reviews/", reviewData);

  return response.data;
}
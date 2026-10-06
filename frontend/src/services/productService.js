import api from "./api";

function notifyProductsChanged(detail) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("admin:products-changed", { detail })
    );
  }
}

export async function getProducts() {
  const response = await api.get("/api/products/");

  return response.data;
}

export async function getProduct(productId) {
  const response = await api.get(`/api/products/${productId}`);

  return response.data;
}

export async function createProduct(productData) {
  const response = await api.post("/api/products/", productData);

  notifyProductsChanged({
    type: "upsert",
    product: response.data,
  });

  return response.data;
}

export async function updateProduct(productId, productData) {
  const response = await api.patch(
    `/api/products/${productId}`,
    productData
  );

  notifyProductsChanged({
    type: "upsert",
    product: response.data,
  });

  return response.data;
}

export async function deleteProduct(productId) {
  const response = await api.delete(`/api/products/${productId}`);

  notifyProductsChanged({
    type: "deactivate",
    productId,
  });

  return response.data;
}

export { getProductImages } from "./productImageService";
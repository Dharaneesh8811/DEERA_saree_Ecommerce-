import api from "./api";

export async function getProductVariants() {
  const response = await api.get("/api/product-variants");

  return response.data;
}

export async function createProductVariant(variantData) {
  const response = await api.post("/api/product-variants", variantData);

  return response.data;
}

export async function updateProductVariant(variantId, variantData) {
  const response = await api.patch(
    `/api/product-variants/${variantId}`,
    variantData
  );

  return response.data;
}

export async function deleteProductVariant(variantId) {
  const response = await api.delete(`/api/product-variants/${variantId}`);

  return response.data;
}
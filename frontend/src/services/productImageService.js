import api from "./api";

/* --------------------------------
   GET PRODUCT IMAGES
-------------------------------- */

export async function getProductImages(productId) {
  const response = await api.get(
    `/api/product-images/product/${productId}`
  );

  return response.data;
}

/* --------------------------------
   UPLOAD PRODUCT IMAGE
-------------------------------- */

export async function uploadProductImage(
  productId,
  file
) {
  const formData = new FormData();

  formData.append("image", file);

  const response = await api.post(
    `/api/product-images/upload/${productId}`,
    formData
  );

  return response.data;
}

/* --------------------------------
   DELETE PRODUCT IMAGE
-------------------------------- */

export async function deleteProductImage(
  productId,
  imageId
) {
  const response = await api.delete(
    `/api/product-images/${imageId}`
  );

  return response.data;
}
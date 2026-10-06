import api from "./api";

export async function getCategories() {
  const response = await api.get("/api/categories");
  return response.data;
}

export async function getCategory(categoryId) {
  const response = await api.get(`/api/categories/${categoryId}`);
  return response.data;
}

export async function createCategory(categoryData) {
  const response = await api.post("/api/categories", categoryData);
  return response.data;
}

export async function updateCategory(categoryId, categoryData) {
  const response = await api.patch(
    `/api/categories/${categoryId}`,
    categoryData
  );
  return response.data;
}

export async function deleteCategory(categoryId) {
  const response = await api.delete(`/api/categories/${categoryId}`);
  return response.data;
}

export async function uploadCategoryImage(categoryId, file) {
  const formData = new FormData();

  formData.append("image", file);

  const response = await api.post(
    `/api/categories/upload/${categoryId}`,
    formData
  );

  return response.data;
}
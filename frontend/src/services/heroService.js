import api from "./api";

export async function getHeroImage() {
  const response = await api.get("/api/hero/");
  return response.data;
}

export async function saveHeroSettings({ heading, description, image }) {
  const formData = new FormData();
  formData.append("heading", heading);
  formData.append("description", description);
  if (image) formData.append("image", image);
  const response = await api.put("/api/hero/", formData);
  return response.data;
}

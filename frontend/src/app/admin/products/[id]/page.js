"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";

import { getProduct } from "@/services/productService";
import { getProductImages } from "@/services/productImageService";

import {
  createProductVariant,
  deleteProductVariant,
  getProductVariants,
  updateProductVariant,
} from "@/services/productVariantService";

import "../../admin.css";
import "../products.css";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  mrp: "",
  fabric: "",
  weave: "",
  zari: "",
  length: "",
};

function getProductErrorMessage(error) {
  const status = error.response?.status;
  const detail = error.response?.data?.detail;

  if (status === 401) {
    return "Your admin session has expired. Please sign in again.";
  }

  if (status === 403) {
    return "You do not have permission to edit this product.";
  }

  if (status === 404) {
    return "Product not found.";
  }

  if (status === 422) {
    if (Array.isArray(detail)) {
      return (
        detail
          .map((item) => item.msg)
          .filter(Boolean)
          .join(" ") || "Please check the product fields."
      );
    }

    return typeof detail === "string"
      ? detail
      : "Please check the product fields.";
  }

  if (status >= 500) {
    return "The server could not update this product. Please try again.";
  }

  if (error.request && !error.response) {
    return "Unable to connect to the server. Please check the backend.";
  }

  return typeof detail === "string"
    ? detail
    : "Something went wrong. Please try again.";
}

function getImageErrorMessage(error) {
  const status = error.response?.status;

  if (status === 401) {
    return "Your admin session has expired.";
  }

  if (status === 403) {
    return "You do not have permission to upload images.";
  }

  if (status === 404) {
    return "Product not found.";
  }

  if (status === 422) {
    return "Please select a valid image.";
  }

  if (status >= 500) {
    return "The server could not upload the image.";
  }

  if (error.request && !error.response) {
    return "Unable to connect to the server.";
  }

  return "Unable to upload the image.";
}

export default function EditProductPage() {
  const params = useParams();
  const productId = params?.id;

  const requestedProductId = useRef(null);
  const fileInputRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [isActive, setIsActive] = useState(true);
  const [isEditorPick, setIsEditorPick] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (!productId || requestedProductId.current === productId) {
      return;
    }

    requestedProductId.current = productId;

    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const productData = await getProduct(productId);

        setProduct(productData);

        setForm({
          name: productData.name || "",
          description: productData.description || "",
          price:
            productData.price !== null && productData.price !== undefined
              ? String(productData.price)
              : "",
          mrp:
            productData.mrp !== null && productData.mrp !== undefined
              ? String(productData.mrp)
              : "",
          fabric: productData.fabric || "",
          weave: productData.weave || "",
          zari: productData.zari || "",
          length: productData.saree_length || "",
        });

        setIsActive(Boolean(productData.is_active));
        setIsEditorPick(Boolean(productData.is_editor_pick));

        try {
          const productImages = await getProductImages(productId);

          setImages(
            Array.isArray(productImages) ? productImages : []
          );
        } catch {
          setImages([]);
        }
      } catch (requestError) {
        setError(getProductErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setError("Enter a valid selling price.");
      return;
    }

    if (form.mrp !== "" && Number(form.mrp) < Number(form.price)) {
      setError("MRP should be greater than or equal to the selling price.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      mrp: form.mrp === "" ? null : Number(form.mrp),
      fabric: form.fabric.trim() || null,
      weave: form.weave.trim() || null,
      zari: form.zari.trim() || null,
      saree_length: form.length.trim() || null,
      is_active: isActive,
      is_editor_pick: isEditorPick,
    };

    setSaving(true);

    try {
      const updatedProduct = await updateProduct(productId, payload);

      setProduct(updatedProduct);

      setMessage("Product updated successfully.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (requestError) {
      console.error("Update product error:", requestError);

      setError(getProductErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Deactivate "${product?.name || "this product"}"? It will be hidden from customers, and historical orders will be preserved.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      await deleteProduct(productId);

      window.location.href = "/admin/products";
    } catch (requestError) {
      console.error("Delete product error:", requestError);

      setError(getProductErrorMessage(requestError));
      setDeleting(false);
    }
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageError("");
    setUploadingImage(true);

    try {
      const uploadedImage = await uploadProductImage(productId, file);

      setImages((current) => [
        ...current,
        uploadedImage,
      ]);
    } catch (requestError) {
      console.error("Upload product image error:", requestError);

      setImageError(getImageErrorMessage(requestError));
    } finally {
      setUploadingImage(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />

        <main className="admin-main edit-product-main">
          <div className="edit-product-loading">
            <div className="edit-loading-spinner"></div>
            <p>Loading product...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="admin-layout">
        <AdminSidebar />

        <main className="admin-main edit-product-main">
          <div className="edit-product-header">
            <div>
              <span className="edit-product-eyebrow">
                CATALOG / PRODUCTS / EDIT
              </span>
              <h1>Edit Product</h1>
            </div>

            <Link
              href="/admin/products"
              className="edit-back-button"
            >
              ← Products
            </Link>
          </div>

          <div className="edit-product-error">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main edit-product-main">
        {/* HEADER */}
        <div className="edit-product-header">
          <div>
            <span className="edit-product-eyebrow">
              CATALOG / PRODUCTS / EDIT
            </span>

            <h1>Edit Product</h1>

            <p>
              Update the details of your DEERA product.
            </p>
          </div>

          <Link
            href={`/admin/products/${productId}`}
            className="edit-back-button"
          >
            ← Product Details
          </Link>
        </div>

        {/* SUCCESS */}
        {message && (
          <div className="edit-product-success">
            <span>✓</span>
            {message}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="edit-product-error">
            <span>!</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* BASIC INFORMATION */}
          <section className="edit-product-card">
            <div className="edit-section-header">
              <div>
                <span className="edit-section-number">
                  01
                </span>

                <div>
                  <h2>Basic Information</h2>
                  <p>
                    Update the main information displayed for this product.
                  </p>
                </div>
              </div>
            </div>

            <div className="edit-form-grid">
              <div className="edit-form-field edit-field-full">
                <label htmlFor="name">
                  Product Name
                  <span>*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  maxLength={200}
                  required
                />
              </div>

              <div className="edit-form-field edit-field-full">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the saree..."
                  rows={5}
                />
              </div>
            </div>
          </section>

          {/* PRICING */}
          <section className="edit-product-card">
            <div className="edit-section-header">
              <div>
                <span className="edit-section-number">
                  02
                </span>

                <div>
                  <h2>Pricing</h2>
                  <p>
                    Update the selling price and original MRP.
                  </p>
                </div>
              </div>
            </div>

            <div className="edit-form-grid edit-price-grid">
              <div className="edit-form-field">
                <label htmlFor="price">
                  Selling Price
                  <span>*</span>
                </label>

                <div className="edit-price-input">
                  <span>₹</span>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="15000"
                    required
                  />
                </div>
              </div>

              <div className="edit-form-field">
                <label htmlFor="mrp">
                  MRP
                </label>

                <div className="edit-price-input">
                  <span>₹</span>

                  <input
                    id="mrp"
                    name="mrp"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.mrp}
                    onChange={handleChange}
                    placeholder="17000"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* PRODUCT INFORMATION */}
          <section className="edit-product-card">
            <div className="edit-section-header">
              <div>
                <span className="edit-section-number">
                  03
                </span>

                <div>
                  <h2>Product Information</h2>
                  <p>
                    Add the technical details customers need.
                  </p>
                </div>
              </div>
            </div>

            <div className="edit-form-grid">
              <div className="edit-form-field">
                <label htmlFor="fabric">
                  Fabric
                </label>

                <input
                  id="fabric"
                  name="fabric"
                  type="text"
                  value={form.fabric}
                  onChange={handleChange}
                  placeholder="Example: Pure Silk"
                />
              </div>

              <div className="edit-form-field">
                <label htmlFor="weave">
                  Weave
                </label>

                <input
                  id="weave"
                  name="weave"
                  type="text"
                  value={form.weave}
                  onChange={handleChange}
                  placeholder="Example: Handloom"
                />
              </div>

              <div className="edit-form-field">
                <label htmlFor="zari">
                  Zari
                </label>

                <input
                  id="zari"
                  name="zari"
                  type="text"
                  value={form.zari}
                  onChange={handleChange}
                  placeholder="Example: Pure Zari"
                />
              </div>

              <div className="edit-form-field">
                <label htmlFor="length">
                  Saree Length
                </label>

                <input
                  id="length"
                  name="length"
                  type="text"
                  value={form.length}
                  onChange={handleChange}
                  placeholder="Example: 5.5 meters"
                />
              </div>
            </div>
          </section>

          {/* PRODUCT STATUS */}
          <section className="edit-product-card">
            <div className="edit-section-header">
              <div>
                <span className="edit-section-number">
                  04
                </span>

                <div>
                  <h2>Product Status</h2>
                  <p>
                    Control how this product appears in the storefront.
                  </p>
                </div>
              </div>
            </div>

            <div className="edit-status-grid">
              <label
                className={`edit-toggle-card ${
                  isActive ? "active" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) =>
                    setIsActive(event.target.checked)
                  }
                />

                <span className="edit-toggle-switch">
                  <span></span>
                </span>

                <span className="edit-toggle-content">
                  <strong>Active Product</strong>
                  <small>
                    Product is visible on the storefront.
                  </small>
                </span>
              </label>

              <label
                className={`edit-toggle-card ${
                  isEditorPick ? "active" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={isEditorPick}
                  onChange={(event) =>
                    setIsEditorPick(event.target.checked)
                  }
                />

                <span className="edit-toggle-switch">
                  <span></span>
                </span>

                <span className="edit-toggle-content">
                  <strong>Editor's Pick</strong>
                  <small>
                    Show this product in Editor's Picks.
                  </small>
                </span>
              </label>
            </div>
          </section>

          {/* IMAGES */}
          <section className="edit-product-card">
            <div className="edit-section-header">
              <div>
                <span className="edit-section-number">
                  05
                </span>

                <div>
                  <h2>Product Images</h2>
                  <p>
                    Manage the images used for this product.
                  </p>
                </div>
              </div>
            </div>

            {imageError && (
              <div className="edit-image-error">
                {imageError}
              </div>
            )}

            <div className="edit-images-grid">
              {images.map((image) => (
                <div
                  className="edit-image-card"
                  key={image.id}
                >
                  <img
                    src={image.image_url}
                    alt={image.alt_text || product?.name || "Product"}
                  />

                  {image.is_primary && (
                    <span className="edit-primary-badge">
                      Primary
                    </span>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="edit-upload-card"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                <span className="edit-upload-icon">
                  +
                </span>

                <strong>
                  {uploadingImage
                    ? "Uploading..."
                    : "Add Image"}
                </strong>

                <small>
                  JPG, PNG or WebP
                </small>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                hidden
              />
            </div>
          </section>

          {/* ACTIONS */}
          <div className="edit-product-actions">
            <Link
              href="/admin/products"
              className="edit-cancel-button"
            >
              Cancel
            </Link>

            <button
              type="button"
              className="edit-delete-button"
              onClick={handleDelete}
              disabled={deleting || saving}
            >
              {deleting ? "Deleting..." : "Delete Product"}
            </button>

            <button
              type="submit"
              className="edit-save-button"
              disabled={saving || deleting}
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
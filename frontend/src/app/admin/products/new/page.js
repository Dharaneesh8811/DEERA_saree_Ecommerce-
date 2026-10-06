"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { getCategories } from "@/services/categoryService";
import { createProduct } from "@/services/productService";
import { uploadProductImage } from "@/services/productImageService";

import "../../admin.css";
import "./new.css";

export default function NewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    mrp: "",
    fabric: "",
    category_id: "",
    occasion: "",
    is_editor_pick: false,
  });

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedImages, setSelectedImages] = useState([]);
  const [createdProductId, setCreatedProductId] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        setCategoriesError("");

        const data = await getCategories();

        const activeCategories = Array.isArray(data)
          ? data.filter((category) => category.is_active !== false)
          : [];

        setCategories(activeCategories);

        if (activeCategories.length === 0) {
          setCategoriesError(
            "No active categories are available. Create a category first."
          );
        }
      } catch (requestError) {
        console.error("Category loading error:", requestError);

        setCategoriesError(
          "Unable to load categories. Please refresh and try again."
        );
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleImageChange(event) {
    const files = Array.from(event.target.files || []);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    const invalidFile = files.find(
      (file) =>
        !allowedTypes.includes(file.type) ||
        file.size > 10 * 1024 * 1024
    );

    if (invalidFile) {
      setError(
        "Only JPEG, PNG, WebP and AVIF images up to 10 MB are allowed."
      );

      event.target.value = "";
      return;
    }

    setError("");
    setSelectedImages(files);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.category_id) {
      setError("Please select a category.");
      return;
    }

    if (!form.name.trim()) {
      setError("Please enter a product name.");
      return;
    }

    if (!form.price) {
      setError("Please enter the selling price.");
      return;
    }

    if (!form.fabric.trim()) {
      setError("Please enter the fabric.");
      return;
    }

    setLoading(true);
    let productId = createdProductId;

    try {
      if (!productId) {
        const productPayload = {
          name: form.name.trim(),
          category_id: form.category_id,
          description: form.description.trim() || null,
          price: Number(form.price),
          mrp: form.mrp ? Number(form.mrp) : null,
          fabric: form.fabric.trim(),
          occasion: form.occasion || null,
          is_active: true,
          is_editor_pick: Boolean(form.is_editor_pick),
        };

        const createdProduct = await createProduct(productPayload);
        productId = createdProduct.id;
        setCreatedProductId(productId);
      }

      if (selectedImages.length > 0) {
        for (const file of selectedImages) {
          await uploadProductImage(productId, file);
          setSelectedImages((current) =>
            current.filter((selectedFile) => selectedFile !== file)
          );
        }
      }

      setCreatedProductId("");
      setSelectedImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSuccess("Product created successfully. Redirecting...");

      window.setTimeout(() => {
        router.push("/admin/products");
      }, 1200);
    } catch (requestError) {
      console.error("Create product error:", requestError);

      if (productId) {
        const uploadDetail = requestError.response?.data?.detail;
        setError(
          `Product created, but an image could not be uploaded${typeof uploadDetail === "string" ? `: ${uploadDetail}` : ""}. Submit again to retry the remaining image uploads.`
        );
        return;
      }

      const status = requestError.response?.status;
      const detail = requestError.response?.data?.detail;

      if (status === 401) {
        setError(
          "Your session has expired. Please sign in again."
        );
      } else if (status === 403) {
        setError(
          "You do not have permission to create products."
        );
      } else if (status === 404) {
        setError(
          typeof detail === "string"
            ? detail
            : "The selected category was not found."
        );
      } else if (status === 422) {
        const validationMessages = Array.isArray(detail)
          ? detail
              .map((item) => {
                const field = Array.isArray(item.loc)
                  ? item.loc[item.loc.length - 1]
                  : "";

                return field
                  ? `${field}: ${item.msg}`
                  : item.msg;
              })
              .filter(Boolean)
              .join(" ")
          : typeof detail === "string"
            ? detail
            : "";

        setError(
          validationMessages ||
            "Please check the product details and try again."
        );
      } else if (
        requestError.request &&
        !requestError.response
      ) {
        setError(
          "Unable to connect to the server. Please try again."
        );
      } else if (status >= 500) {
        setError(
          "The server could not create the product. Please try again."
        );
      } else {
        setError(
          typeof detail === "string"
            ? detail
            : "Unable to create product. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-page-header new-product-header">
          <div>
            <span className="admin-eyebrow">
              CATALOG
            </span>

            <h1>Add Product</h1>

            <p>
              Add a new silk saree to your DEERA catalog.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="new-product-back"
          >
            ← Back to Products
          </Link>
        </div>

        <form
          className="admin-card product-form-card"
          onSubmit={handleSubmit}
        >
          {/* BASIC INFORMATION */}

          <div className="product-form-section">
            <div className="product-form-section-title">
              <h2>Basic Information</h2>

              <p>
                Enter the main information about the product.
              </p>
            </div>

            <div className="product-form-group">
              <label htmlFor="name">
                Product Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Example: Kanchipuram Pure Silk Saree"
                required
              />
            </div>

            <div className="product-form-group">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the saree, weave, zari, occasion, etc."
                rows={5}
              />
            </div>
          </div>

          {/* PRICING */}

          <div className="product-form-section">
            <div className="product-form-section-title">
              <h2>Pricing</h2>

              <p>
                Set the selling price and MRP.
              </p>
            </div>

            <div className="product-form-two-column">
              <div className="product-form-group">
                <label htmlFor="price">
                  Selling Price
                </label>

                <div className="price-input">
                  <span>₹</span>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="12500"
                    required
                  />
                </div>
              </div>

              <div className="product-form-group">
                <label htmlFor="mrp">
                  MRP
                </label>

                <div className="price-input">
                  <span>₹</span>

                  <input
                    id="mrp"
                    name="mrp"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.mrp}
                    onChange={handleChange}
                    placeholder="15000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCT INFORMATION */}

          <div className="product-form-section">
            <div className="product-form-section-title">
              <h2>Product Information</h2>

              <p>
                Add the fabric details for this saree.
              </p>
            </div>

            <div className="product-form-group">
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
                required
              />

              <span className="product-form-help">
                Enter the fabric type of the saree.
              </span>
            </div>
          </div>

          {/* OCCASION */}

          <div className="product-form-section">
            <div className="product-form-section-title">
              <h2>Occasion</h2>

              <p>
                Select the occasion for this saree.
              </p>
            </div>

            <div className="product-form-group">
              <label htmlFor="occasion">
                Occasion
              </label>

              <select
                id="occasion"
                name="occasion"
                value={form.occasion}
                onChange={handleChange}
              >
                <option value="">
                  Select an occasion
                </option>

                <option value="Wedding">
                  Wedding
                </option>

                <option value="Festive">
                  Festive
                </option>

                <option value="Everyday">
                  Everyday
                </option>

                <option value="Gifting">
                  Gifting
                </option>
              </select>

              <span className="product-form-help">
                Choose where this saree should appear in
                Find Your Moment.
              </span>
            </div>
          </div>

          {/* EDITOR'S PICK */}

          <div className="editor-pick-box">
            <label className="editor-pick-option">
              <input
                type="checkbox"
                name="is_editor_pick"
                checked={form.is_editor_pick}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    is_editor_pick:
                      event.target.checked,
                  }))
                }
              />

              <span className="editor-pick-check"></span>

              <span className="editor-pick-content">
                <strong>
                  Editor&apos;s Pick
                </strong>

                <small>
                  Feature this product in the
                  Editor&apos;s Picks section.
                </small>
              </span>
            </label>
          </div>

          {/* CATEGORY */}

          <div className="product-form-section">
            <div className="product-form-section-title">
              <h2>Category</h2>

              <p>
                Select the category for this product.
              </p>
            </div>

            <div className="product-form-group">
              <label htmlFor="category_id">
                Category
              </label>

              <select
                id="category_id"
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
                disabled={
                  categoriesLoading ||
                  categories.length === 0
                }
              >
                <option value="">
                  {categoriesLoading
                    ? "Loading categories..."
                    : categories.length === 0
                      ? "No categories available"
                      : "Select a category"}
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              <span className="product-form-help">
                {categoriesError ||
                  "Select the category for this product."}
              </span>
            </div>
          </div>

          {/* IMAGES */}

          <div className="product-form-section">
            <div className="product-form-section-title">
              <h2>Product Images</h2>

              <p>
                Add the images customers will see for
                this saree.
              </p>
            </div>

            <div className="product-image-upload">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                onChange={handleImageChange}
                className="product-image-input"
              />

              <button
                type="button"
                className="product-image-upload-button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                + Choose Images
              </button>

              <p className="product-form-help">
                JPEG, PNG, WebP or AVIF. Maximum 10 MB
                per image.
              </p>
            </div>

            {selectedImages.length > 0 && (
              <div className="selected-image-list">
                {selectedImages.map((file, index) => (
                  <div
                    className="selected-image-item"
                    key={`${file.name}-${index}`}
                  >
                    <span>
                      {file.name}
                    </span>

                    <small>
                      {(file.size / 1024 / 1024).toFixed(
                        2
                      )}{" "}
                      MB
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ERROR */}

          {error && (
            <div className="product-form-error">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <p
              role="status"
              style={{
                color: "#5c7661",
                margin: "22px 28px 0",
                fontSize: 12,
              }}
            >
              {success}
            </p>
          )}

          {/* ACTIONS */}

          <div className="product-form-actions">
            <Link
              href="/admin/products"
              className="product-cancel-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="admin-primary-button"
              disabled={
                loading ||
                categoriesLoading ||
                categories.length === 0
              }
            >
              {loading
                ? "Creating..."
                : createdProductId
                  ? "Retry Image Upload"
                  : "Create Product"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
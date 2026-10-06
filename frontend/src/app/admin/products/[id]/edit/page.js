"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Check,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import AdminSidebar from "@/components/admin/AdminSidebar";

import {
  getProduct,
  updateProduct,
  deleteProduct,
} from "@/services/productService";

import { getCategories } from "@/services/categoryService";

import {
  getProductImages,
  uploadProductImage,
  deleteProductImage,
} from "@/services/productImageService";

import {
  createProductVariant,
  deleteProductVariant,
  getProductVariants,
  updateProductVariant,
} from "@/services/productVariantService";

import "../../../admin.css";
import "./edit.css";

const MAX_PRODUCT_IMAGES = 3;

const emptyForm = {
  name: "",
  category_id: "",
  description: "",
  price: "",
  mrp: "",
  fabric: "",
  weave: "",
  zari: "",
  length: "",
  occasion: "",
  is_editor_pick: false,
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const productId = params?.id;

  const [form, setForm] = useState(emptyForm);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [deletingImageId, setDeletingImageId] =
    useState(null);

  const [variantBusyId, setVariantBusyId] =
    useState(null);

  const [newVariant, setNewVariant] = useState({
    name: "",
    sku: "",
    price: "",
    stock_quantity: "0",
  });

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ================================
     LOAD PRODUCT
  ================================ */

  useEffect(() => {
    if (!productId) return;

    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        productResponse,
        imagesResponse,
        categoriesResponse,
        variantsResponse,
      ] = await Promise.allSettled([
        getProduct(productId),
        getProductImages(productId),
        getCategories(),
        getProductVariants(),
      ]);

      if (productResponse.status === "rejected") {
        throw productResponse.reason;
      }

      const productData =
        productResponse.value?.data ||
        productResponse.value;

      if (!productData) {
        throw new Error("Product not found");
      }

      setProduct(productData);

      /* Categories */

      if (categoriesResponse.status === "fulfilled") {
        setCategories(
          Array.isArray(categoriesResponse.value)
            ? categoriesResponse.value
            : []
        );
      } else {
        setCategories([
          {
            id: productData.category_id,
            name: "Current category",
            is_active: true,
          },
        ]);
      }

      /* Product form */

      setForm({
        name: productData.name || "",
        category_id:
          productData.category_id || "",
        description:
          productData.description || "",
        price: productData.price ?? "",
        mrp: productData.mrp ?? "",
        fabric: productData.fabric || "",
        weave: productData.weave || "",
        zari: productData.zari || "",
        length:
          productData.saree_length ||
          productData.length ||
          "",
        occasion:
          productData.occasion || "",
        is_editor_pick: Boolean(
          productData.is_editor_pick
        ),
      });

      /* Product images */

      if (imagesResponse.status === "fulfilled") {
        const imageData =
          imagesResponse.value?.data ||
          imagesResponse.value ||
          [];

        const loadedImages =
          Array.isArray(imageData)
            ? imageData
            : imageData?.items || [];

        setImages(loadedImages);
      } else {
        setImages([]);
      }

      /* Product variants */

      if (variantsResponse.status === "fulfilled") {
        setVariants(
          Array.isArray(
            variantsResponse.value
          )
            ? variantsResponse.value.filter(
                (variant) =>
                  variant.product_id ===
                  productId
              )
            : []
        );
      } else {
        setError(
          "Unable to load product variants. Please reload and try again."
        );
      }
    } catch (err) {
      console.error(
        "Failed to load product:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to load product."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     FORM CHANGE
  ================================ */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleEditorPickChange = (
    event
  ) => {
    setForm((current) => ({
      ...current,
      is_editor_pick:
        event.target.checked,
    }));

    setError("");
    setSuccess("");
  };

  /* ================================
     SAVE PRODUCT
  ================================ */

  const handleSave = async (event) => {
    event.preventDefault();

    if (!productId) return;

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError(
        "Product name is required."
      );
      return;
    }

    if (!form.price) {
      setError(
        "Selling price is required."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),

        category_id:
          form.category_id,

        description:
          form.description.trim() ||
          null,

        price: Number(form.price),

        mrp: form.mrp
          ? Number(form.mrp)
          : null,

        fabric:
          form.fabric.trim() ||
          null,

        weave:
          form.weave.trim() ||
          null,

        zari:
          form.zari.trim() ||
          null,

        saree_length:
          form.length.trim() ||
          null,

        occasion:
          form.occasion || null,

        is_editor_pick:
          Boolean(form.is_editor_pick),

        is_active:
          Boolean(product.is_active),
      };

      const response =
        await updateProduct(
          productId,
          payload
        );

      const updatedProduct =
        response?.data || response;

      setProduct((current) => ({
        ...current,
        ...updatedProduct,
      }));

      setSuccess(
        "Product updated successfully."
      );
    } catch (err) {
      console.error(
        "Update product error:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================================
     DELETE PRODUCT
  ================================ */

  const handleDelete = async () => {
    if (!productId || deleting) return;

    const confirmed =
      window.confirm(
        "Deactivate this product? It will be hidden from customers, and historical orders will be preserved."
      );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await deleteProduct(productId);

      setSuccess(
        "Product deactivated successfully."
      );

      setTimeout(() => {
        router.push("/admin/products");
      }, 800);
    } catch (err) {
      console.error(
        "Delete product error:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to delete product."
      );

      setDeleting(false);
    }
  };

  /* ================================
     IMAGE SELECT
  ================================ */

  const handleFileSelect = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    /*
      IMAGE LIMIT

      1 Primary
      2 Secondary
      ----------------
      3 Maximum
    */

    if (
      images.length >=
      MAX_PRODUCT_IMAGES
    ) {
      setError(
        "Maximum 3 images allowed: 1 primary image and 2 secondary images."
      );

      event.target.value = "";
      return;
    }

    /* File size */

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Image size must be 10MB or less."
      );

      event.target.value = "";
      return;
    }

    /* File type */

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Only JPG, PNG, WebP or AVIF images are allowed."
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  /* ================================
     UPLOAD IMAGE
  ================================ */

  const handleUploadImage =
    async () => {
      if (
        !selectedFile ||
        !productId ||
        uploading
      ) {
        return;
      }

      /*
        SECOND SAFETY CHECK

        Never allow more than:

        1 Primary
        2 Secondary
        = 3 total
      */

      if (
        images.length >=
        MAX_PRODUCT_IMAGES
      ) {
        setError(
          "Maximum 3 images allowed: 1 primary image and 2 secondary images."
        );

        setSelectedFile(null);

        if (fileInputRef.current) {
          fileInputRef.current.value =
            "";
        }

        return;
      }

      try {
        setUploading(true);
        setError("");
        setSuccess("");

        await uploadProductImage(
          productId,
          selectedFile
        );

        setSelectedFile(null);

        if (fileInputRef.current) {
          fileInputRef.current.value =
            "";
        }

        await refreshImages();

        setSuccess(
          images.length === 0
            ? "Primary image uploaded successfully."
            : "Secondary image uploaded successfully."
        );
      } catch (err) {
        console.error(
          "Upload image error:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            err?.userMessage ||
            err?.message ||
            "Failed to upload product image."
        );
      } finally {
        setUploading(false);
      }
    };

  /* ================================
     REFRESH IMAGES
  ================================ */

  const refreshImages = async () => {
    try {
      const response =
        await getProductImages(
          productId
        );

      const imageData =
        response?.data ||
        response ||
        [];

      const refreshedImages =
        Array.isArray(imageData)
          ? imageData
          : imageData?.items || [];

      setImages(refreshedImages);
    } catch (err) {
      console.error(
        "Failed to refresh images:",
        err
      );
    }
  };

  /* ================================
     DELETE IMAGE
  ================================ */

  const handleDeleteImage =
    async (image) => {
      if (
        !productId ||
        !image?.id ||
        deletingImageId
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this image?"
        );

      if (!confirmed) return;

      try {
        setDeletingImageId(
          image.id
        );

        setError("");
        setSuccess("");

        await deleteProductImage(
          productId,
          image.id
        );

        setImages((current) =>
          current.filter(
            (item) =>
              item.id !== image.id
          )
        );

        setSuccess(
          "Product image deleted successfully."
        );
      } catch (err) {
        console.error(
          "Delete image error:",
          err
        );

        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "Failed to delete product image."
        );
      } finally {
        setDeletingImageId(null);
      }
    };

  /* ================================
     VARIANTS
  ================================ */

  const handleVariantChange = (
    variantId,
    field,
    value
  ) => {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      )
    );
  };

  const handleSaveVariant =
    async (variant) => {
      if (variantBusyId) return;

      if (
        !variant.name.trim() ||
        !variant.sku.trim()
      ) {
        setError(
          "Variant name and SKU are required."
        );
        return;
      }

      const stockQuantity = Number(
        variant.stock_quantity
      );

      const variantPrice =
        variant.price === ""
          ? null
          : Number(variant.price);

      if (
        !Number.isInteger(
          stockQuantity
        ) ||
        stockQuantity < 0
      ) {
        setError(
          "Stock quantity must be a non-negative whole number."
        );
        return;
      }

      if (
        variantPrice !== null &&
        (!Number.isFinite(
          variantPrice
        ) ||
          variantPrice < 0)
      ) {
        setError(
          "Variant price must be a valid non-negative number."
        );
        return;
      }

      try {
        setVariantBusyId(
          variant.id
        );

        setError("");
        setSuccess("");

        const updatedVariant =
          await updateProductVariant(
            variant.id,
            {
              name: variant.name.trim(),
              sku: variant.sku.trim(),
              price: variantPrice,
              stock_quantity:
                stockQuantity,
              is_active: Boolean(
                variant.is_active
              ),
            }
          );

        setVariants((current) =>
          current.map((item) =>
            item.id ===
            updatedVariant.id
              ? updatedVariant
              : item
          )
        );

        setSuccess(
          "Product variant updated successfully."
        );
      } catch (err) {
        setError(
          err?.userMessage ||
            err?.response?.data
              ?.detail ||
            err?.message ||
            "Failed to update product variant."
        );
      } finally {
        setVariantBusyId(null);
      }
    };

  const handleCreateVariant =
    async () => {
      if (
        variantBusyId ||
        !newVariant.name.trim() ||
        !newVariant.sku.trim()
      ) {
        return;
      }

      const stockQuantity = Number(
        newVariant.stock_quantity
      );

      const variantPrice =
        newVariant.price === ""
          ? null
          : Number(newVariant.price);

      if (
        !Number.isInteger(
          stockQuantity
        ) ||
        stockQuantity < 0
      ) {
        setError(
          "Stock quantity must be a non-negative whole number."
        );
        return;
      }

      if (
        variantPrice !== null &&
        (!Number.isFinite(
          variantPrice
        ) ||
          variantPrice < 0)
      ) {
        setError(
          "Variant price must be a valid non-negative number."
        );
        return;
      }

      try {
        setVariantBusyId("new");

        setError("");
        setSuccess("");

        const createdVariant =
          await createProductVariant({
            product_id: productId,
            name: newVariant.name.trim(),
            sku: newVariant.sku.trim(),
            price: variantPrice,
            stock_quantity:
              stockQuantity,
            is_active: true,
          });

        setVariants((current) => [
          createdVariant,
          ...current,
        ]);

        setNewVariant({
          name: "",
          sku: "",
          price: "",
          stock_quantity: "0",
        });

        setSuccess(
          "Product variant created successfully."
        );
      } catch (err) {
        setError(
          err?.userMessage ||
            err?.response?.data
              ?.detail ||
            err?.message ||
            "Failed to create product variant."
        );
      } finally {
        setVariantBusyId(null);
      }
    };

  const handleDeleteVariant =
    async (variant) => {
      if (variantBusyId) return;

      if (
        !window.confirm(
          `Delete the ${variant.name} variant?`
        )
      ) {
        return;
      }

      try {
        setVariantBusyId(
          variant.id
        );

        setError("");
        setSuccess("");

        await deleteProductVariant(
          variant.id
        );

        setVariants((current) =>
          current.filter(
            (item) =>
              item.id !== variant.id
          )
        );

        setSuccess(
          "Product variant deleted successfully."
        );
      } catch (err) {
        setError(
          err?.userMessage ||
            err?.response?.data
              ?.detail ||
            err?.message ||
            "Failed to delete product variant."
        );
      } finally {
        setVariantBusyId(null);
      }
    };

  /* ================================
     CLEAR SELECTED FILE
  ================================ */

  const clearSelectedFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }

    setError("");
    setSuccess("");
  };

  /* ================================
     IMAGE URL
  ================================ */

  const getImageUrl = (image) => {
    return (
      image?.image_url ||
      image?.url ||
      image?.image ||
      image?.src ||
      ""
    );
  };

  /* ================================
     LOADING
  ================================ */

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />

        <main className="edit-product-page">
          <div className="edit-loading">
            <Loader2
              size={28}
              className="edit-spinner"
            />

            <p>
              Loading product...
            </p>
          </div>
        </main>
      </div>
    );
  }

  /* ================================
     NOT FOUND
  ================================ */

  if (!product) {
    return (
      <div className="admin-layout">
        <AdminSidebar />

        <main className="edit-product-page">
          <div className="edit-empty">
            <div className="edit-empty-icon">
              <X size={30} />
            </div>

            <h2>
              Product not found
            </h2>

            <p>
              {error ||
                "The product you are looking for does not exist."}
            </p>

            <Link
              href="/admin/products"
              className="edit-back-button"
            >
              <ArrowLeft size={18} />
              Back to Products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const imageLimitReached =
    images.length >=
    MAX_PRODUCT_IMAGES;

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="edit-product-page">

        {/* HEADER */}

        <header className="edit-page-header">
          <Link
            href="/admin/products"
            className="edit-back-link"
          >
            <ArrowLeft size={17} />
            Back to Products
          </Link>

          <div className="edit-heading-row">
            <div>
              <span className="edit-eyebrow">
                CATALOG
              </span>

              <h1>
                Edit Product
              </h1>

              <p>
                Update product information,
                settings and images.
              </p>
            </div>

            <span
              className={`product-status-badge ${
                product.is_active
                  ? "status-active"
                  : "status-inactive"
              }`}
            >
              {product.is_active
                ? "Active"
                : "Inactive"}
            </span>
          </div>
        </header>

        <form
          className="edit-product-form"
          onSubmit={handleSave}
        >

          {/* ALERTS */}

          {(error || success) && (
            <div
              className={`edit-alert ${
                error
                  ? "edit-alert-error"
                  : "edit-alert-success"
              }`}
            >
              {error ? (
                <X size={18} />
              ) : (
                <Check size={18} />
              )}

              <span>
                {error || success}
              </span>
            </div>
          )}

          {/* PRODUCT INFORMATION */}

          <section className="edit-section">
            <div className="edit-section-heading">
              <div>
                <span>01</span>

                <div>
                  <h2>
                    Product Information
                  </h2>

                  <p>
                    Basic information shown
                    to customers.
                  </p>
                </div>
              </div>
            </div>

            <div className="edit-fields edit-fields-product">

              <div className="edit-field">
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
                />
              </div>

              <div className="edit-field">
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

              <div className="edit-field">
                <label htmlFor="category_id">
                  Category
                  <span>*</span>
                </label>

                <select
                  id="category_id"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                >
                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                        {category.is_active
                          ? ""
                          : " (Inactive)"}
                      </option>
                    )
                  )}

                  {!categories.some(
                    (category) =>
                      category.id ===
                      form.category_id
                  ) && (
                    <option
                      value={
                        form.category_id
                      }
                    >
                      Current category
                    </option>
                  )}
                </select>
              </div>

              <div className="edit-field edit-field-full">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={
                    form.description
                  }
                  onChange={handleChange}
                  placeholder="Enter product description"
                />
              </div>

            </div>
          </section>

          {/* PRICING + DETAILS */}

          <div className="edit-two-column">

            {/* PRICING */}

            <section className="edit-section">
              <div className="edit-section-heading">
                <div>
                  <span>02</span>

                  <div>
                    <h2>
                      Pricing
                    </h2>

                    <p>
                      Product pricing
                      information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="edit-fields edit-fields-two">

                <div className="edit-field">
                  <label htmlFor="price">
                    Selling Price
                    <span>*</span>
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
                      placeholder="15000"
                    />
                  </div>
                </div>

                <div className="edit-field">
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
                      placeholder="18000"
                    />
                  </div>
                </div>

              </div>
            </section>

            {/* PRODUCT DETAILS */}

            <section className="edit-section">
              <div className="edit-section-heading">
                <div>
                  <span>03</span>

                  <div>
                    <h2>
                      Product Details
                    </h2>

                    <p>
                      Saree details and
                      occasion.
                    </p>
                  </div>
                </div>
              </div>

              <div className="edit-fields edit-fields-two">

                <div className="edit-field">
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

                <div className="edit-field">
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

                <div className="edit-field">
                  <label htmlFor="length">
                    Saree Length
                  </label>

                  <input
                    id="length"
                    name="length"
                    type="text"
                    value={form.length}
                    onChange={handleChange}
                    placeholder="6.3 meters"
                  />
                </div>

                <div className="edit-field">
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
                      Select occasion
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
                </div>

              </div>
            </section>

          </div>

          {/* STORE SETTINGS */}

          <section className="edit-section">
            <div className="edit-section-heading">
              <div>
                <span>04</span>

                <div>
                  <h2>
                    Store Settings
                  </h2>

                  <p>
                    Control how this product
                    appears in the store.
                  </p>
                </div>
              </div>
            </div>

            <div className="store-settings">

              {/* EDITOR PICK */}

              <label className="editor-pick-box">
                <input
                  type="checkbox"
                  checked={
                    form.is_editor_pick
                  }
                  onChange={
                    handleEditorPickChange
                  }
                />

                <span className="custom-checkbox">
                  <Check size={14} />
                </span>

                <span className="setting-content">
                  <strong>
                    Editor's Pick
                  </strong>

                  <small>
                    Feature this product
                    in the Editor's Picks
                    section.
                  </small>
                </span>
              </label>

              {/* STATUS */}

              <div className="status-setting">

                <div className="setting-title">
                  <strong>
                    Product Visibility
                  </strong>

                  <small>
                    Choose whether customers
                    can see this product.
                  </small>
                </div>

                <div className="status-options">

                  <label className="status-option">
                    <input
                      type="radio"
                      name="product-status"
                      checked={
                        product.is_active ===
                        true
                      }
                      onChange={() =>
                        setProduct(
                          (current) => ({
                            ...current,
                            is_active: true,
                          })
                        )
                      }
                    />

                    <span className="status-radio">
                      <span />
                    </span>

                    <div>
                      <strong>
                        Active
                      </strong>

                      <small>
                        Visible to customers
                      </small>
                    </div>
                  </label>

                  <label className="status-option">
                    <input
                      type="radio"
                      name="product-status"
                      checked={
                        product.is_active ===
                        false
                      }
                      onChange={() =>
                        setProduct(
                          (current) => ({
                            ...current,
                            is_active: false,
                          })
                        )
                      }
                    />

                    <span className="status-radio">
                      <span />
                    </span>

                    <div>
                      <strong>
                        Inactive
                      </strong>

                      <small>
                        Hidden from customers
                      </small>
                    </div>
                  </label>

                </div>
              </div>

            </div>
          </section>

          {/* PRODUCT IMAGES */}

          <section className="edit-section">

            <div className="edit-section-heading">
              <div>
                <span>05</span>

                <div>
                  <h2>
                    Product Images
                  </h2>

                  <p>
                    1 primary image and
                    maximum 2 secondary images.
                  </p>
                </div>
              </div>
            </div>

            <div className="image-manager">

              {/* IMAGE COUNT */}

              <div
                style={{
                  marginBottom: "16px",
                  fontSize: "12px",
                  letterSpacing:
                    "0.08em",
                  textTransform:
                    "uppercase",
                  color:
                    "rgba(50, 35, 25, 0.55)",
                }}
              >
                {images.length}/
                {MAX_PRODUCT_IMAGES}{" "}
                images added
              </div>

              {/* EXISTING IMAGES */}

              {images.length > 0 && (
                <div className="existing-images">

                  {images
                    .slice(
                      0,
                      MAX_PRODUCT_IMAGES
                    )
                    .map(
                      (
                        image,
                        index
                      ) => {
                        const imageUrl =
                          getImageUrl(
                            image
                          );

                        if (!imageUrl) {
                          return null;
                        }

                        const imageId =
                          image.id;

                        const isDeleting =
                          deletingImageId ===
                          imageId;

                        return (
                          <div
                            className="existing-image"
                            key={
                              imageId ||
                              `${imageUrl}-${index}`
                            }
                          >

                            <img
                              src={imageUrl}
                              alt={
                                product.name ||
                                "Product image"
                              }
                            />

                            {/* PRIMARY */}

                            {index === 0 && (
                              <span className="primary-image-label">
                                Primary
                              </span>
                            )}

                            {/* SECONDARY */}

                            {index > 0 && (
                              <span className="primary-image-label">
                                Secondary
                              </span>
                            )}

                            {/* DELETE */}

                            <button
                              type="button"
                              className="delete-image-button"
                              onClick={() =>
                                handleDeleteImage(
                                  image
                                )
                              }
                              disabled={
                                isDeleting
                              }
                              aria-label="Delete product image"
                            >
                              {isDeleting ? (
                                <Loader2
                                  size={16}
                                  className="edit-spinner"
                                />
                              ) : (
                                <Trash2
                                  size={16}
                                />
                              )}
                            </button>

                          </div>
                        );
                      }
                    )}

                </div>
              )}

              {/* UPLOAD AREA */}

              <div
                className="upload-area"
                style={{
                  opacity:
                    imageLimitReached
                      ? 0.65
                      : 1,
                }}
              >

                <div className="upload-icon">
                  {imageLimitReached ? (
                    <Check size={25} />
                  ) : (
                    <ImagePlus size={25} />
                  )}
                </div>

                <div className="upload-content">

                  <strong>
                    {imageLimitReached
                      ? "Image Limit Reached"
                      : "Add Product Image"}
                  </strong>

                  <span>
                    {imageLimitReached
                      ? "Maximum 3 images: 1 primary + 2 secondary"
                      : "JPG, PNG, WebP or AVIF · Maximum 10MB"}
                  </span>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
                    onChange={
                      handleFileSelect
                    }
                    className="hidden-file-input"
                    disabled={
                      imageLimitReached
                    }
                  />

                  <button
                    type="button"
                    className="choose-file-button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={
                      imageLimitReached
                    }
                  >
                    {imageLimitReached ? (
                      <>
                        <Check size={16} />
                        3 Images Added
                      </>
                    ) : (
                      <>
                        <ImagePlus
                          size={16}
                        />
                        Choose Image
                      </>
                    )}
                  </button>

                </div>
              </div>

              {/* SELECTED FILE */}

              {selectedFile && (
                <div className="selected-file">

                  <div>
                    <strong>
                      {selectedFile.name}
                    </strong>

                    <span>
                      {(
                        selectedFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </span>
                  </div>

                  <div className="selected-file-actions">

                    <button
                      type="button"
                      className="remove-file-button"
                      onClick={
                        clearSelectedFile
                      }
                      disabled={
                        uploading
                      }
                      aria-label="Remove selected image"
                    >
                      <X size={16} />
                    </button>

                    <button
                      type="button"
                      className="upload-button"
                      onClick={
                        handleUploadImage
                      }
                      disabled={
                        uploading ||
                        imageLimitReached
                      }
                    >
                      {uploading ? (
                        <>
                          <Loader2
                            size={16}
                            className="edit-spinner"
                          />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload
                            size={16}
                          />
                          Upload
                        </>
                      )}
                    </button>

                  </div>
                </div>
              )}

            </div>
          </section>

          {/* PRODUCT VARIANTS */}

          <section className="edit-section">

            <div className="edit-section-heading">
              <div>
                <span>06</span>

                <div>
                  <h2>
                    Variants and Stock
                  </h2>

                  <p>
                    Manage product options,
                    prices and inventory.
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                padding:
                  "22px 24px 24px",
              }}
            >

              {variants.map(
                (variant) => (
                  <div
                    key={variant.id}
                    className="edit-fields edit-fields-two"
                    style={{
                      padding:
                        "14px 0",
                      borderBottom:
                        "1px solid #eee6df",
                    }}
                  >

                    <div className="edit-field">
                      <label
                        htmlFor={`variant-name-${variant.id}`}
                      >
                        Variant Name
                      </label>

                      <input
                        id={`variant-name-${variant.id}`}
                        value={
                          variant.name
                        }
                        onChange={(
                          event
                        ) =>
                          handleVariantChange(
                            variant.id,
                            "name",
                            event.target
                              .value
                          )
                        }
                        disabled={
                          variantBusyId !==
                          null
                        }
                      />
                    </div>

                    <div className="edit-field">
                      <label
                        htmlFor={`variant-sku-${variant.id}`}
                      >
                        SKU
                      </label>

                      <input
                        id={`variant-sku-${variant.id}`}
                        value={
                          variant.sku
                        }
                        onChange={(
                          event
                        ) =>
                          handleVariantChange(
                            variant.id,
                            "sku",
                            event.target
                              .value
                          )
                        }
                        disabled={
                          variantBusyId !==
                          null
                        }
                      />
                    </div>

                    <div className="edit-field">
                      <label
                        htmlFor={`variant-price-${variant.id}`}
                      >
                        Price
                      </label>

                      <input
                        id={`variant-price-${variant.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          variant.price ??
                          ""
                        }
                        onChange={(
                          event
                        ) =>
                          handleVariantChange(
                            variant.id,
                            "price",
                            event.target
                              .value
                          )
                        }
                        disabled={
                          variantBusyId !==
                          null
                        }
                      />
                    </div>

                    <div className="edit-field">
                      <label
                        htmlFor={`variant-stock-${variant.id}`}
                      >
                        Stock Quantity
                      </label>

                      <input
                        id={`variant-stock-${variant.id}`}
                        type="number"
                        min="0"
                        step="1"
                        value={
                          variant.stock_quantity
                        }
                        onChange={(
                          event
                        ) =>
                          handleVariantChange(
                            variant.id,
                            "stock_quantity",
                            event.target
                              .value
                          )
                        }
                        disabled={
                          variantBusyId !==
                          null
                        }
                      />
                    </div>

                    <label className="edit-field">
                      <span>
                        Active
                      </span>

                      <input
                        type="checkbox"
                        checked={Boolean(
                          variant.is_active
                        )}
                        onChange={(
                          event
                        ) =>
                          handleVariantChange(
                            variant.id,
                            "is_active",
                            event.target
                              .checked
                          )
                        }
                        disabled={
                          variantBusyId !==
                          null
                        }
                      />
                    </label>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems:
                          "end",
                      }}
                    >

                      <button
                        type="button"
                        className="choose-file-button"
                        onClick={() =>
                          handleSaveVariant(
                            variant
                          )
                        }
                        disabled={
                          variantBusyId !==
                          null
                        }
                      >
                        {variantBusyId ===
                        variant.id
                          ? "Saving..."
                          : "Save"}
                      </button>

                      <button
                        type="button"
                        className="remove-file-button"
                        onClick={() =>
                          handleDeleteVariant(
                            variant
                          )
                        }
                        disabled={
                          variantBusyId !==
                          null
                        }
                        aria-label={`Delete ${variant.name} variant`}
                      >
                        <Trash2
                          size={16}
                        />
                      </button>

                    </div>

                  </div>
                )
              )}

              {/* NEW VARIANT */}

              <div
                className="edit-fields edit-fields-two"
                style={{
                  padding:
                    "20px 0 0",
                }}
              >

                <div className="edit-field">
                  <label htmlFor="new-variant-name">
                    New Variant Name
                  </label>

                  <input
                    id="new-variant-name"
                    value={
                      newVariant.name
                    }
                    onChange={(event) =>
                      setNewVariant(
                        (current) => ({
                          ...current,
                          name: event.target
                            .value,
                        })
                      )
                    }
                    disabled={
                      variantBusyId !==
                      null
                    }
                  />
                </div>

                <div className="edit-field">
                  <label htmlFor="new-variant-sku">
                    SKU
                  </label>

                  <input
                    id="new-variant-sku"
                    value={
                      newVariant.sku
                    }
                    onChange={(event) =>
                      setNewVariant(
                        (current) => ({
                          ...current,
                          sku: event.target
                            .value,
                        })
                      )
                    }
                    disabled={
                      variantBusyId !==
                      null
                    }
                  />
                </div>

                <div className="edit-field">
                  <label htmlFor="new-variant-price">
                    Price
                  </label>

                  <input
                    id="new-variant-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      newVariant.price
                    }
                    onChange={(event) =>
                      setNewVariant(
                        (current) => ({
                          ...current,
                          price: event.target
                            .value,
                        })
                      )
                    }
                    disabled={
                      variantBusyId !==
                      null
                    }
                  />
                </div>

                <div className="edit-field">
                  <label htmlFor="new-variant-stock">
                    Stock Quantity
                  </label>

                  <input
                    id="new-variant-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={
                      newVariant.stock_quantity
                    }
                    onChange={(event) =>
                      setNewVariant(
                        (current) => ({
                          ...current,
                          stock_quantity:
                            event.target
                              .value,
                        })
                      )
                    }
                    disabled={
                      variantBusyId !==
                      null
                    }
                  />
                </div>

                <div>
                  <button
                    type="button"
                    className="choose-file-button"
                    onClick={
                      handleCreateVariant
                    }
                    disabled={
                      variantBusyId !==
                        null ||
                      !newVariant.name.trim() ||
                      !newVariant.sku.trim()
                    }
                  >
                    {variantBusyId ===
                    "new"
                      ? "Adding..."
                      : "Add Variant"}
                  </button>
                </div>

              </div>
            </div>
          </section>

          {/* ACTIONS */}

          <div className="edit-actions">

            <button
              type="button"
              className="delete-product-button"
              onClick={
                handleDelete
              }
              disabled={
                deleting || saving
              }
            >
              {deleting ? (
                <>
                  <Loader2
                    size={16}
                    className="edit-spinner"
                  />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete Product
                </>
              )}
            </button>

            <div className="edit-actions-right">

              <Link
                href="/admin/products"
                className="cancel-button"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="save-product-button"
                disabled={
                  saving || deleting
                }
              >
                {saving ? (
                  <>
                    <Loader2
                      size={16}
                      className="edit-spinner"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>

            </div>
          </div>

        </form>
      </main>
    </div>
  );
}
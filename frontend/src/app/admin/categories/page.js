"use client";

import { useEffect, useRef, useState } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  uploadCategoryImage,
} from "@/services/categoryService";

import "../admin.css";

const emptyCategoryForm = {
  name: "",
  product_type: "",
  saree: "",
  description: "",
  is_active: true,
  image_file: null,
};

const inputStyle = {
  width: "100%",
  minHeight: 42,
  boxSizing: "border-box",
  padding: "0 12px",
  border: "1px solid #ded5ca",
  borderRadius: 7,
  background: "#fffdf8",
  color: "#332825",
  fontFamily: "inherit",
  fontSize: 12,
};

const actionButtonStyle = {
  minHeight: 38,
  padding: "0 14px",
  border: 0,
  borderRadius: 7,
  background: "#651b2e",
  color: "#fff",
  fontFamily: "inherit",
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
};

function getCategoryErrorMessage(error, action) {
  const status = error.response?.status;
  const detail = error.response?.data?.detail;

  if (status === 401) {
    return "Your admin session is missing or has expired.";
  }

  if (status === 403) {
    return `You do not have permission to ${action} categories.`;
  }

  if (status === 404) {
    return "The category was not found.";
  }

  if (status === 415) {
    return "Only JPEG, PNG, WebP, and AVIF images are supported.";
  }

  if (status === 413) {
    return "Image must be smaller than 10 MB.";
  }

  if (status === 422) {
    return Array.isArray(detail)
      ? detail.map((issue) => issue.msg).filter(Boolean).join(" ") ||
          "Check the category fields and try again."
      : typeof detail === "string"
        ? detail
        : "Check the category fields and try again.";
  }

  if (error.request && !error.response) {
    return "Unable to connect to the server. Please try again.";
  }

  if (status === 502) {
    return typeof detail === "string"
      ? detail
      : "Category image upload failed. Check RustFS availability and bucket permissions.";
  }

  if (status >= 500 && action === "delete") {
    return "Could not deactivate this category. Please try again.";
  }

  if (status >= 500) {
    return `The server could not ${action} this category. Please try again.`;
  }

  return typeof detail === "string"
    ? detail
    : `Unable to ${action} this category. Please try again.`;
}

function CategoryFields({
  form,
  setForm,
  idPrefix,
  disabled,
}) {
  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: 16,
      }}
    >
      {/* NAME */}
      <div>
        <label
          htmlFor={`${idPrefix}-name`}
          style={{
            display: "block",
            marginBottom: 7,
            color: "#51443e",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          Name
        </label>

        <input
          id={`${idPrefix}-name`}
          value={form.name}
          onChange={(event) =>
            updateField("name", event.target.value)
          }
          maxLength={100}
          required
          disabled={disabled}
          style={inputStyle}
          placeholder="Example: Kanchipuram Silk"
        />
      </div>

      {/* PRODUCT TYPE */}
      <div>
        <label
          htmlFor={`${idPrefix}-product-type`}
          style={{
            display: "block",
            marginBottom: 7,
            color: "#51443e",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          Product Type
        </label>

        <input
          id={`${idPrefix}-product-type`}
          value={form.product_type}
          onChange={(event) =>
            updateField(
              "product_type",
              event.target.value
            )
          }
          maxLength={50}
          required
          disabled={disabled}
          style={inputStyle}
          placeholder="Example: Silk"
        />
      </div>

      {/* SAREE */}
      <div>
        <label
          htmlFor={`${idPrefix}-saree`}
          style={{
            display: "block",
            marginBottom: 7,
            color: "#51443e",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          Saree
        </label>

        <input
          id={`${idPrefix}-saree`}
          value={form.saree}
          onChange={(event) =>
            updateField(
              "saree",
              event.target.value
            )
          }
          maxLength={100}
          required
          disabled={disabled}
          style={inputStyle}
          placeholder="Example: Kanchipuram Saree"
        />
      </div>

      {/* ACTIVE */}
      <div
        style={{
          display: "flex",
          alignItems: "end",
          paddingBottom: 11,
        }}
      >
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            color: "#51443e",
            fontSize: 12,
          }}
        >
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) =>
              updateField(
                "is_active",
                event.target.checked
              )
            }
            disabled={disabled}
          />

          Active
        </label>
      </div>

      {/* IMAGE */}
      <div style={{ gridColumn: "1 / -1" }}>
        <label
          htmlFor={`${idPrefix}-image`}
          style={{
            display: "block",
            marginBottom: 7,
            color: "#51443e",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          Category Image
        </label>

        <input
          id={`${idPrefix}-image`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={disabled}
          onChange={(event) =>
            updateField(
              "image_file",
              event.target.files?.[0] || null
            )
          }
          style={{
            ...inputStyle,
            padding: "9px 12px",
            height: "auto",
          }}
        />

        {form.image_file && (
          <p
            style={{
              marginTop: 7,
              marginBottom: 0,
              color: "#766c67",
              fontSize: 11,
            }}
          >
            Selected: {form.image_file.name}
          </p>
        )}
      </div>

      {/* DESCRIPTION */}
      <div style={{ gridColumn: "1 / -1" }}>
        <label
          htmlFor={`${idPrefix}-description`}
          style={{
            display: "block",
            marginBottom: 7,
            color: "#51443e",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          Description
        </label>

        <textarea
          id={`${idPrefix}-description`}
          value={form.description}
          onChange={(event) =>
            updateField(
              "description",
              event.target.value
            )
          }
          maxLength={500}
          rows={3}
          disabled={disabled}
          style={{
            ...inputStyle,
            height: "auto",
            padding: 12,
            resize: "vertical",
          }}
          placeholder="Describe this category..."
        />
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");

  const [showCategories, setShowCategories] = useState(false);

  const [createForm, setCreateForm] = useState(
    emptyCategoryForm
  );

  const [editingId, setEditingId] = useState(null);

  const [editForm, setEditForm] = useState(
    emptyCategoryForm
  );

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [createdCategoryId, setCreatedCategoryId] = useState(null);

  const loadStarted = useRef(false);

  // ---------------------------------------------------------
  // LOAD CATEGORIES
  // ---------------------------------------------------------

  useEffect(() => {
    if (loadStarted.current) return;

    loadStarted.current = true;

    async function loadCategoryList() {
      try {
        const data = await getCategories();

        setCategories(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        setLoadError(
          getCategoryErrorMessage(error, "load")
        );
      } finally {
        setLoading(false);
      }
    }

    loadCategoryList();
  }, []);

  // ---------------------------------------------------------
  // REFRESH
  // ---------------------------------------------------------

  async function refreshCategoryList() {
    const data = await getCategories();

    const updatedCategories =
      Array.isArray(data) ? data : [];

    setCategories(updatedCategories);

    return updatedCategories;
  }

  async function handleRefresh() {
    setRefreshing(true);
    setLoadError("");

    try {
      await refreshCategoryList();
    } catch (error) {
      setLoadError(
        getCategoryErrorMessage(error, "load")
      );
    } finally {
      setRefreshing(false);
    }
  }

  // ---------------------------------------------------------
  // PAYLOAD
  // ---------------------------------------------------------

  function makePayload(form) {
    return {
      name: form.name.trim(),
      product_type: form.product_type.trim(),
      saree: form.saree.trim(),
      description:
        form.description.trim() || null,
      is_active: Boolean(form.is_active),
    };
  }

  // ---------------------------------------------------------
  // CREATE CATEGORY
  // ---------------------------------------------------------

  async function handleCreate(event) {
    event.preventDefault();

    setActionError("");
    setMessage("");

    const payload = makePayload(createForm);

    if (
      !payload.name ||
      !payload.product_type ||
      !payload.saree
    ) {
      setActionError(
        "Name, product type, and saree are required."
      );
      return;
    }

    setSaving(true);
    let categoryId = createdCategoryId;

    try {
      if (!categoryId) {
        const createdCategory = await createCategory(payload);
        categoryId = createdCategory.id;
        setCreatedCategoryId(categoryId);
      }

      if (createForm.image_file) {
        await uploadCategoryImage(
          categoryId,
          createForm.image_file
        );
      }

      setCreateForm({
        ...emptyCategoryForm,
      });
      setCreatedCategoryId(null);

      setMessage(
        createForm.image_file
          ? "Category and image created successfully."
          : "Category created successfully."
      );

      try {
        await refreshCategoryList();
        setLoadError("");
      } catch {
        setLoadError(
          "Category created, but the list could not be refreshed."
        );
      }
    } catch (error) {
      if (categoryId) {
        try {
          await refreshCategoryList();
          setLoadError("");
        } catch {
          setLoadError(
            "Category was created, but the category list could not be refreshed."
          );
        }

        setActionError(
          `Category created, but its image could not be uploaded${typeof error.response?.data?.detail === "string" ? `: ${error.response.data.detail}` : ""}. Submit again to retry the image upload.`
        );
      } else {
        setActionError(
          getCategoryErrorMessage(error, "create")
        );
      }
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------
  // START EDITING
  // ---------------------------------------------------------

  function startEditing(category) {
    setActionError("");
    setMessage("");

    setEditingId(category.id);

    setEditForm({
      name: category.name || "",
      product_type:
        category.product_type || "",
      saree: category.saree || "",
      description:
        category.description || "",
      is_active:
        Boolean(category.is_active),
      image_file: null,
    });
  }

  // ---------------------------------------------------------
  // UPDATE CATEGORY
  // ---------------------------------------------------------

  async function handleUpdate(
    event,
    categoryId
  ) {
    event.preventDefault();

    setActionError("");
    setMessage("");

    const payload = makePayload(editForm);

    if (
      !payload.name ||
      !payload.product_type ||
      !payload.saree
    ) {
      setActionError(
        "Name, product type, and saree are required."
      );
      return;
    }

    setSaving(true);

    try {
      // 1. Update details
      await updateCategory(
        categoryId,
        payload
      );

      // 2. Upload new image
      if (editForm.image_file) {
        await uploadCategoryImage(
          categoryId,
          editForm.image_file
        );
      }

      // 3. Refresh
      try {
        await refreshCategoryList();
        setLoadError("");
      } catch {
        setLoadError(
          "Category updated, but the list could not be refreshed."
        );
      }

      setEditingId(null);

      setMessage(
        editForm.image_file
          ? "Category and image updated successfully."
          : "Category updated successfully."
      );
    } catch (error) {
      setActionError(
        getCategoryErrorMessage(
          error,
          "update"
        )
      );
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------
  // DELETE CATEGORY
  // ---------------------------------------------------------

  async function handleDelete(category) {
    const confirmed = window.confirm(
      `Deactivate "${category.name}"? Products and historical records assigned to it will be preserved.`
    );

    if (!confirmed) return;

    setActionError("");
    setMessage("");

    setDeletingId(category.id);

    try {
      await deleteCategory(category.id);

      setCategories((current) =>
        current.map((item) =>
          item.id === category.id
            ? { ...item, is_active: false }
            : item
        )
      );

      if (editingId === category.id) {
        setEditingId(null);
      }

      setMessage(
        "Category deactivated successfully."
      );
    } catch (error) {
      setActionError(
        getCategoryErrorMessage(
          error,
          "delete"
        )
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ---------------------------------------------------------
  // TOGGLE CATEGORY LIST
  // ---------------------------------------------------------

  function handleViewCategories() {
    setActionError("");
    setMessage("");

    setShowCategories((current) => !current);
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-page-header">
          <span className="admin-eyebrow">
            CATALOG MANAGEMENT
          </span>

          <h1>Categories</h1>

          <p>
            Manage product categories used
            throughout the catalog.
          </p>
        </div>

        {/* ================================================= */}
        {/* ADD CATEGORY */}
        {/* ================================================= */}

        <section
          className="admin-card admin-panel"
          style={{ marginBottom: 20 }}
        >
          <div className="admin-panel-header">
            <h2>Add Category</h2>

            <p>
              Enter the category details used
              by your product catalog.
            </p>
          </div>

          <form onSubmit={handleCreate}>
            <CategoryFields
              form={createForm}
              setForm={setCreateForm}
              idPrefix="new-category"
              disabled={saving || Boolean(createdCategoryId)}
            />

            <button
              type="submit"
              disabled={saving}
              style={{
                ...actionButtonStyle,
                marginTop: 16,
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving
                ? "Creating..."
                : createdCategoryId
                  ? "Retry Image Upload"
                  : "Create Category"}
            </button>
          </form>
        </section>

        {/* ================================================= */}
        {/* VIEW CATEGORY BUTTON */}
        {/* ================================================= */}

        <section
          className="admin-card admin-panel"
          style={{ marginBottom: 20 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#332825",
                  fontSize: 18,
                }}
              >
                Categories
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#766c67",
                  fontSize: 12,
                }}
              >
                {categories.length} categor
                {categories.length === 1
                  ? "y"
                  : "ies"}{" "}
                available
              </p>
            </div>

            <button
              type="button"
              onClick={handleViewCategories}
              disabled={loading}
              style={{
                ...actionButtonStyle,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {showCategories
                ? "Hide Categories"
                : "View Categories"}
            </button>
          </div>
        </section>

        {/* ================================================= */}
        {/* CATEGORY LIST */}
        {/* ================================================= */}

        {showCategories && (
          <section
            className="admin-card admin-panel"
            aria-label="Category list"
          >
            <div
              className="admin-panel-header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <h2>Category List</h2>

                <p>
                  {categories.length} categor
                  {categories.length === 1
                    ? "y"
                    : "ies"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={
                  refreshing || loading
                }
                style={{
                  ...actionButtonStyle,
                  opacity:
                    refreshing || loading
                      ? 0.6
                      : 1,
                }}
              >
                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>

            {loading ? (
              <div
                className="admin-empty-activity"
                role="status"
              >
                <h3>
                  Loading categories...
                </h3>
              </div>
            ) : loadError &&
              categories.length === 0 ? (
              <div
                className="admin-empty-activity"
                role="alert"
              >
                <h3>{loadError}</h3>
              </div>
            ) : categories.length === 0 ? (
              <div className="admin-empty-activity">
                <div className="admin-empty-icon">
                  ◇
                </div>

                <h3>
                  No categories found.
                </h3>

                <p>
                  Categories you create will
                  appear here.
                </p>
              </div>
            ) : (
              <div>
                {categories.map(
                  (category) => (
                    <article
                      key={category.id}
                      style={{
                        padding: "16px 0",
                        borderBottom:
                          "1px solid #eee4d7",
                      }}
                    >
                      {editingId ===
                      category.id ? (
                        <form
                          onSubmit={(event) =>
                            handleUpdate(
                              event,
                              category.id
                            )
                          }
                        >
                          <CategoryFields
                            form={editForm}
                            setForm={
                              setEditForm
                            }
                            idPrefix={`edit-category-${category.id}`}
                            disabled={
                              saving ||
                              deletingId ===
                                category.id
                            }
                          />

                          <div
                            style={{
                              display:
                                "flex",
                              gap: 8,
                              marginTop: 14,
                            }}
                          >
                            <button
                              type="submit"
                              disabled={saving}
                              style={{
                                ...actionButtonStyle,
                                opacity:
                                  saving
                                    ? 0.6
                                    : 1,
                              }}
                            >
                              {saving
                                ? "Saving..."
                                : "Save Changes"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setEditingId(
                                  null
                                )
                              }
                              disabled={saving}
                              style={{
                                ...actionButtonStyle,
                                border:
                                  "1px solid #ded5ca",
                                background:
                                  "#fffdf8",
                                color:
                                  "#5d504a",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div
                          className="admin-overview-item"
                          style={{
                            alignItems:
                              "flex-start",
                          }}
                        >
                          {/* IMAGE */}
                          <div
                            style={{
                              width: 70,
                              height: 70,
                              flexShrink: 0,
                              borderRadius: 8,
                              overflow:
                                "hidden",
                              background:
                                "#f1e5d0",
                              border:
                                "1px solid #ded5ca",
                            }}
                          >
                            {category.image_url ? (
                              <img
                                src={
                                  category.image_url
                                }
                                alt={
                                  category.name
                                }
                                style={{
                                  width:
                                    "100%",
                                  height:
                                    "100%",
                                  objectFit:
                                    "cover",
                                  display:
                                    "block",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width:
                                    "100%",
                                  height:
                                    "100%",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  color:
                                    "#8d796c",
                                  fontSize: 10,
                                  textAlign:
                                    "center",
                                  padding: 5,
                                }}
                              >
                                No image
                              </div>
                            )}
                          </div>

                          {/* DETAILS */}
                          <div
                            style={{
                              minWidth: 0,
                              flex: 1,
                            }}
                          >
                            <strong>
                              {category.name}
                            </strong>

                            <span
                              style={{
                                display:
                                  "block",
                                marginTop: 5,
                                color:
                                  "#766c67",
                                fontSize: 12,
                              }}
                            >
                              Product Type:{" "}
                              {category.product_type ||
                                "—"}
                            </span>

                            <span
                              style={{
                                display:
                                  "block",
                                marginTop: 4,
                                color:
                                  "#766c67",
                                fontSize: 12,
                              }}
                            >
                              Saree:{" "}
                              {category.saree ||
                                "—"}
                            </span>

                            {category.description && (
                              <span
                                style={{
                                  display:
                                    "block",
                                  marginTop: 5,
                                  color:
                                    "#918782",
                                  fontSize: 12,
                                }}
                              >
                                {
                                  category.description
                                }
                              </span>
                            )}

                            <span
                              style={{
                                display:
                                  "block",
                                marginTop: 5,
                                color:
                                  category.is_active
                                    ? "#47704f"
                                    : "#8b4b4b",
                                fontSize: 11,
                                fontWeight:
                                  600,
                              }}
                            >
                              {category.is_active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>

                          {/* ACTIONS */}
                          <div
                            style={{
                              display:
                                "flex",
                              flexShrink: 0,
                              gap: 8,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                startEditing(
                                  category
                                )
                              }
                              disabled={
                                saving ||
                                deletingId !==
                                  null
                              }
                              style={{
                                ...actionButtonStyle,
                                border:
                                  "1px solid #ded5ca",
                                background:
                                  "#fffdf8",
                                color:
                                  "#5d504a",
                              }}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  category
                                )
                              }
                              disabled={
                                !category.is_active ||
                                saving ||
                                deletingId !==
                                  null
                              }
                              style={{
                                ...actionButtonStyle,
                                border:
                                  "1px solid #e0caca",
                                background:
                                  "transparent",
                                color:
                                  "#8b4b4b",
                                opacity:
                                  deletingId ===
                                  category.id
                                    ? 0.6
                                    : 1,
                              }}
                            >
                              {deletingId ===
                              category.id
                                ? "Deactivating..."
                                : category.is_active
                                  ? "Deactivate"
                                  : "Inactive"}
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  )
                )}
              </div>
            )}

            {loadError &&
              categories.length > 0 && (
                <p
                  role="alert"
                  style={{
                    color: "#9a3c3c",
                    fontSize: 12,
                  }}
                >
                  {loadError}
                </p>
              )}
          </section>
        )}

        {/* ================================================= */}
        {/* MESSAGES */}
        {/* ================================================= */}

        {actionError && (
          <p
            role="alert"
            style={{
              marginTop: 14,
              color: "#9a3c3c",
              fontSize: 12,
            }}
          >
            {actionError}
          </p>
        )}

        {message && (
          <p
            role="status"
            style={{
              marginTop: 14,
              color: "#47704f",
              fontSize: 12,
            }}
          >
            {message}
          </p>
        )}
      </main>
    </div>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { getCategories } from "@/services/categoryService";
import { getProducts } from "@/services/productService";

import "../admin.css";
import "./products.css";

const PRODUCTS_PER_PAGE = 8;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  const [currentPage, setCurrentPage] = useState(1);

  const initialLoadStarted = useRef(false);

  useEffect(() => {
    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;

    async function loadProductsAndCategories() {
      const [productsResult, categoriesResult] = await Promise.allSettled([
        getProducts(),
        getCategories(),
      ]);

      if (productsResult.status === "fulfilled") {
        setProducts(
          Array.isArray(productsResult.value) ? productsResult.value : []
        );
      } else {
        setError("Unable to load products. Please try again.");
      }

      if (categoriesResult.status === "fulfilled") {
        setCategories(
          Array.isArray(categoriesResult.value)
            ? categoriesResult.value
            : []
        );
      }

      setLoading(false);
    }

    loadProductsAndCategories();
  }, []);

  /* --------------------------------
     Listen for product changes
  -------------------------------- */
  useEffect(() => {
    function handleProductsChanged(event) {
      const { type, product, productId } = event.detail || {};

      if (type === "upsert" && product) {
        setProducts((current) => {
          const existingIndex = current.findIndex(
            (item) => item.id === product.id
          );

          if (existingIndex === -1) {
            return [product, ...current];
          }

          return current.map((item) =>
            item.id === product.id ? product : item
          );
        });
      } else if (type === "deactivate" && productId) {
        setProducts((current) =>
          current.map((item) =>
            item.id === productId
              ? { ...item, is_active: false }
              : item
          )
        );
      }
    }

    window.addEventListener(
      "admin:products-changed",
      handleProductsChanged
    );

    return () => {
      window.removeEventListener(
        "admin:products-changed",
        handleProductsChanged
      );
    };
  }, []);

  /* --------------------------------
     Category lookup
  -------------------------------- */
  const categoryNamesById = new Map(
    categories.map((category) => [category.id, category.name])
  );

  /* --------------------------------
     Filtering
  -------------------------------- */
  const filteredProducts = products.filter((product) => {
    const categoryName =
      categoryNamesById.get(product.category_id) || "Unknown category";

    const productStatus = product.is_active ? "active" : "inactive";

    const matchesSearch = `${product.name} ${categoryName}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    return (
      matchesSearch &&
      (!categoryFilter || product.category_id === categoryFilter) &&
      (!statusFilter || productStatus === statusFilter)
    );
  });

  /* --------------------------------
     Reset pagination when filters change
  -------------------------------- */
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, statusFilter]);

  /* --------------------------------
     Pagination
  -------------------------------- */
  const totalPages = Math.ceil(
    filteredProducts.length / PRODUCTS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;

  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  /* --------------------------------
     Pagination handlers
  -------------------------------- */
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goToPreviousPage = () => {
    goToPage(currentPage - 1);
  };

  const goToNextPage = () => {
    goToPage(currentPage + 1);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        {/* Header */}
        <div className="products-page-header">
          <div>
            <span className="admin-eyebrow">CATALOG</span>

            <h1>Products</h1>

            <p>
              Manage the sarees available in your DEERA store.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="admin-primary-button"
          >
            + Add Product
          </Link>
        </div>

        {/* Toolbar */}
        <div className="products-toolbar">
          <div className="products-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="products-filter"
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            className="products-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Products */}
        <div className="products-card">
          <div className="products-table-header">
            <span>PRODUCT</span>
            <span>CATEGORY</span>
            <span>PRICE</span>
            <span>STATUS</span>
            <span>ACTION</span>
          </div>

          {loading ? (
            <div className="products-empty">
              <h3>Loading products...</h3>
            </div>
          ) : error ? (
            <div className="products-empty">
              <h3>{error}</h3>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="products-empty">
              <div className="products-empty-icon">□</div>

              <h3>No products found</h3>

              <p>
                Try changing your search or add a new product.
              </p>
            </div>
          ) : (
            paginatedProducts.map((product) => {
              const categoryName =
                categoryNamesById.get(product.category_id) ||
                "Unknown category";

              return (
                <div
                  className="products-table-row"
                  key={product.id}
                >
                  {/* Product */}
                  <div className="product-info">
                    <div className="product-image-placeholder">
                      S
                    </div>

                    <div>
                      <strong>{product.name}</strong>

                      <span>
                        Product #{product.id}
                      </span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="product-category">
                    {categoryName}
                  </div>

                  {/* Price */}
                  <div className="product-price">
                    <strong>
                      ₹
                      {Number(product.price).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                    {product.mrp !== null &&
                      product.mrp !== undefined && (
                        <span>
                          ₹
                          {Number(product.mrp).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      )}
                  </div>

                  {/* Status */}
                  <div>
                    <span className="product-status">
                      <i></i>
                      {product.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="product-action">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      aria-label={`Edit ${product.name}`}
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!loading &&
          !error &&
          filteredProducts.length > 0 && (
            <div className="products-pagination">
              <div className="products-pagination-info">
                Showing{" "}
                <strong>
                  {startIndex + 1}
                </strong>{" "}
                to{" "}
                <strong>
                  {Math.min(
                    startIndex + PRODUCTS_PER_PAGE,
                    filteredProducts.length
                  )}
                </strong>{" "}
                of{" "}
                <strong>
                  {filteredProducts.length}
                </strong>{" "}
                products
              </div>

              {totalPages > 1 && (
                <div className="products-pagination-controls">
                  {/* Previous */}
                  <button
                    type="button"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="products-pagination-button"
                  >
                    ← Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="products-pagination-pages">
                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => goToPage(page)}
                        className={`products-pagination-page ${
                          currentPage === page
                            ? "active"
                            : ""
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Next */}
                  <button
                    type="button"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="products-pagination-button"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}

        {/* Footer */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="products-footer">
            Showing 0 of {products.length} products
          </div>
        )}
      </main>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/services/productService";

export default function ApiTestPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load products");
      }
    }

    loadProducts();
  }, []);

  return (
    <main style={{ padding: "40px" }}>
      <h1>API Connection Test</h1>

      {error && <p>{error}</p>}

      <p>Total products: {products.length}</p>

      {products.map((product) => (
        <div
          key={product.id}
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            marginTop: "15px",
          }}
        >
          <h2>{product.name}</h2>
          <p>Slug: {product.slug}</p>
          <p>Price: ₹{product.price}</p>
          <p>Category ID: {product.category_id}</p>
        </div>
      ))}
    </main>
  );
}
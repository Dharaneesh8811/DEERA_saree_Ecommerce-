"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  getAdminOrder,
  updateOrderItems,
  updateOrderStatus,
} from "@/services/orderService";

import "../../admin.css";
import "../orders.css";

const statusLabels = {
  placed: "Placed",
  under_review: "Under Review",
  confirmed: "Confirmed",
  shipped: "Shipped",
};

const nextStatuses = {
  placed: "under_review",
  under_review: "confirmed",
  confirmed: "shipped",
};

const statusColors = {
  placed: { background: "#f1e5d0", color: "#7a6031" },
  under_review: { background: "#fff3d9", color: "#8a641d" },
  confirmed: { background: "#edf4ed", color: "#47704f" },
  shipped: { background: "#e8eff7", color: "#405f80" },
};

function getOrderErrorMessage(error, action = "load") {
  const status = error.response?.status;
  const detail = error.response?.data?.detail;

  if (status === 401) return "Your admin session is missing or has expired.";
  if (status === 403) {
    return `You do not have permission to ${action} this order.`;
  }
  if (status === 404) return "Order not found.";
  if (status === 400 || status === 409 || status === 422) {
    return typeof detail === "string"
      ? detail
      : action === "update"
        ? "The status change was rejected. Please check the order status and try again."
        : "The server could not process this order request.";
  }
  if (error.request && !error.response) {
    return "Unable to connect to the server. Please try again.";
  }
  if (status >= 500) {
    return `The server could not ${action} this order. Please try again.`;
  }

  return typeof detail === "string"
    ? detail
    : `Unable to ${action} this order. Please try again.`;
}

function getOrderItemsErrorMessage(error) {
  const status = error.response?.status;
  const detail = error.response?.data?.detail;

  if (status === 401) return "Your admin session is missing or has expired.";
  if (status === 403) return "You do not have permission to edit order items.";
  if (status === 404) return "Order or one of its products was not found.";
  if (status === 400 || status === 409 || status === 422) {
    if (Array.isArray(detail)) {
      return (
        detail.map((issue) => issue.msg).filter(Boolean).join(" ") ||
        "The item update was rejected. Check the quantities and try again."
      );
    }
    return typeof detail === "string"
      ? detail
      : "The item update was rejected. Check the quantities and try again.";
  }
  if (error.request && !error.response) {
    return "Unable to connect to the server. Please try again.";
  }
  if (status >= 500) {
    return "The server could not update order items. Please try again.";
  }

  return "Unable to update order items. Please try again.";
}

function createItemDrafts(items = []) {
  return items.map((item) => ({
    rowId: item.id,
    product_id: item.product_id,
    product_variant_id: item.product_variant_id ?? null,
    quantity: String(item.quantity),
  }));
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function formatAmount(value) {
  if (value == null) return "—";

  const amount = Number(value);
  return Number.isFinite(amount)
    ? `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    : "—";
}

function InfoRow({ label, value }) {
  return (
    <div className="admin-overview-item">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const orderId = params?.id;
  const requestedOrderId = useRef(null);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [draftItems, setDraftItems] = useState([]);
  const [savingItems, setSavingItems] = useState(false);
  const [itemsError, setItemsError] = useState("");
  const [itemsMessage, setItemsMessage] = useState("");

  useEffect(() => {
    if (!orderId || requestedOrderId.current === orderId) return;
    requestedOrderId.current = orderId;

    async function loadOrder() {
      try {
        const data = await getAdminOrder(orderId);
        setOrder(data);
        setDraftItems(createItemDrafts(data.items));
      } catch (requestError) {
        setError(getOrderErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  const normalizedStatus = String(order?.status || "").toLowerCase();
  const nextStatus = nextStatuses[normalizedStatus];
  const statusStyle = statusColors[normalizedStatus] || {
    background: "#f1e5d0",
    color: "#62554e",
  };

  async function handleStatusUpdate() {
    if (!order || !nextStatus || selectedStatus !== nextStatus || updatingStatus) {
      return;
    }

    const confirmed = window.confirm(
      `Change order status from ${statusLabels[normalizedStatus]} to ${statusLabels[nextStatus]}?`
    );
    if (!confirmed) return;

    setStatusError("");
    setStatusMessage("");
    setUpdatingStatus(true);

    try {
      const updatedOrder = await updateOrderStatus(orderId, nextStatus);
      setOrder((currentOrder) => ({ ...currentOrder, ...updatedOrder }));
      setSelectedStatus("");
      setStatusMessage("Order status updated successfully.");

      try {
        const refreshedOrder = await getAdminOrder(orderId);
        setOrder(refreshedOrder);
      } catch {
        setStatusMessage(
          "Order status updated successfully. Details could not be refreshed."
        );
      }
    } catch (requestError) {
      setStatusError(getOrderErrorMessage(requestError, "update"));
    } finally {
      setUpdatingStatus(false);
    }
  }

  const hasItemQuantityChanges =
    Array.isArray(order?.items) &&
    order.items.some((item) => {
      const draft = draftItems.find((draftItem) => draftItem.rowId === item.id);
      return draft && Number(draft.quantity) !== item.quantity;
    });

  const itemQuantitiesValid =
    draftItems.length > 0 &&
    draftItems.every(
      (item) => Number.isInteger(Number(item.quantity)) && Number(item.quantity) >= 1
    );

  async function handleItemSave() {
    if (!order || savingItems || !hasItemQuantityChanges) return;
    if (!itemQuantitiesValid) {
      setItemsError("Each item quantity must be a whole number of at least 1.");
      setItemsMessage("");
      return;
    }

    const confirmed = window.confirm("Save the updated quantities for this order?");
    if (!confirmed) return;

    setItemsError("");
    setItemsMessage("");
    setSavingItems(true);

    const payload = draftItems.map((item) => ({
      product_id: item.product_id,
      product_variant_id: item.product_variant_id,
      quantity: Number(item.quantity),
    }));

    try {
      const updatedOrder = await updateOrderItems(orderId, payload);

      try {
        const refreshedOrder = await getAdminOrder(orderId);
        setOrder(refreshedOrder);
        setDraftItems(createItemDrafts(refreshedOrder.items));
        setItemsMessage("Order item quantities saved successfully.");
      } catch {
        setOrder(updatedOrder);
        setDraftItems(createItemDrafts(updatedOrder.items));
        setItemsMessage(
          "Order item quantities saved. The latest order details could not be refreshed."
        );
      }
    } catch (requestError) {
      setItemsError(getOrderItemsErrorMessage(requestError));
    } finally {
      setSavingItems(false);
    }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-page-header">
          <span className="admin-eyebrow">STORE MANAGEMENT / ORDER</span>
          <h1>Order Details</h1>
          <p>Review order, customer, shipping, and item information.</p>
        </div>

        <p style={{ margin: "-12px 0 24px" }}>
          <Link
            href="/admin/orders"
            className="product-secondary-button"
            style={{
              minHeight: 40,
              padding: "0 15px",
              display: "inline-flex",
              alignItems: "center",
              border: "1px solid #ded5ca",
              borderRadius: 7,
              background: "#fffdf8",
              color: "#5d504a",
              fontSize: 12,
              textDecoration: "none",
            }}
          >
            ← Back to Orders
          </Link>
        </p>

        {loading ? (
          <section className="admin-card admin-panel" role="status">
            Loading order...
          </section>
        ) : error ? (
          <section className="admin-card admin-panel" role="alert">
            {error}
          </section>
        ) : order ? (
          <>
            <section className="admin-card admin-panel" aria-label="Order information">
              <div className="admin-panel-header">
                <h2>Order Information</h2>
              </div>
              <div className="admin-overview-list">
                <InfoRow label="Order ID" value={order.id} />
                <div className="admin-overview-item">
                  <span>Status</span>
                  <strong>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 9px",
                        borderRadius: 20,
                        background: statusStyle.background,
                        color: statusStyle.color,
                        fontSize: 10,
                      }}
                    >
                      {statusLabels[normalizedStatus] || order.status || "—"}
                    </span>
                  </strong>
                </div>
                {nextStatus ? (
                  <div
                    className="admin-overview-item"
                    style={{ alignItems: "center", flexWrap: "wrap" }}
                  >
                    <span>Update status</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <select
                        aria-label="Next order status"
                        value={selectedStatus}
                        onChange={(event) => setSelectedStatus(event.target.value)}
                        disabled={updatingStatus}
                        style={{
                          minHeight: 38,
                          padding: "0 10px",
                          border: "1px solid #ded5ca",
                          borderRadius: 7,
                          background: "#fffdf8",
                          color: "#5d504a",
                          fontFamily: "inherit",
                          fontSize: 12,
                        }}
                      >
                        <option value="">Select next status</option>
                        <option value={nextStatus}>{statusLabels[nextStatus]}</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleStatusUpdate}
                        disabled={updatingStatus || selectedStatus !== nextStatus}
                        style={{
                          minHeight: 38,
                          padding: "0 13px",
                          border: 0,
                          borderRadius: 7,
                          background: "#651b2e",
                          color: "#fff",
                          fontFamily: "inherit",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: updatingStatus ? "wait" : "pointer",
                          opacity: updatingStatus || selectedStatus !== nextStatus ? 0.6 : 1,
                        }}
                      >
                        {updatingStatus ? "Updating..." : "Update Status"}
                      </button>
                    </div>
                  </div>
                ) : normalizedStatus === "shipped" ? (
                  <div className="admin-overview-item">
                    <span>Order progress</span>
                    <strong>Order has reached the final status.</strong>
                  </div>
                ) : null}
                <InfoRow label="Created" value={formatDate(order.created_at)} />
                <InfoRow label="Updated" value={formatDate(order.updated_at)} />
              </div>
              {statusError && (
                <p role="alert" style={{ margin: "18px 0 0", color: "#9a3c3c", fontSize: 12 }}>
                  {statusError}
                </p>
              )}
              {statusMessage && (
                <p role="status" style={{ margin: "18px 0 0", color: "#47704f", fontSize: 12 }}>
                  {statusMessage}
                </p>
              )}
            </section>

            <section
              className="admin-dashboard-grid"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginTop: 20 }}
            >
              <div className="admin-card admin-panel" aria-label="Customer information">
                <div className="admin-panel-header">
                  <h2>Customer</h2>
                </div>
                <div className="admin-overview-list">
                  <InfoRow label="Name" value={order.customer_name} />
                  <InfoRow label="Phone" value={order.customer_phone} />
                  {order.customer_email && (
                    <InfoRow label="Email" value={order.customer_email} />
                  )}
                </div>
              </div>

              <div className="admin-card admin-panel" aria-label="Shipping information">
                <div className="admin-panel-header">
                  <h2>Shipping</h2>
                </div>
                <div className="admin-overview-list">
                  <InfoRow label="Address" value={order.shipping_address_line1} />
                  {order.shipping_address_line2 && (
                    <InfoRow label="Address line 2" value={order.shipping_address_line2} />
                  )}
                  <InfoRow label="City" value={order.shipping_city} />
                  <InfoRow label="State" value={order.shipping_state} />
                  <InfoRow label="Postal code" value={order.shipping_postal_code} />
                  <InfoRow label="Country" value={order.shipping_country} />
                </div>
              </div>
            </section>

            <section className="admin-card admin-panel" style={{ marginTop: 20 }} aria-label="Order totals">
              <div className="admin-panel-header">
                <h2>Order Totals</h2>
              </div>
              <div className="admin-overview-list">
                <InfoRow label="Subtotal" value={formatAmount(order.subtotal)} />
                <InfoRow label="Total amount" value={formatAmount(order.total_amount)} />
                <InfoRow label="Final amount" value={formatAmount(order.final_amount)} />
              </div>
            </section>

            <section className="admin-card admin-panel" style={{ marginTop: 20 }} aria-label="Order items">
              <div className="admin-panel-header">
                <h2>Order Items</h2>
              </div>
              {Array.isArray(order.items) && order.items.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", minWidth: 620, borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr>
                        {["PRODUCT", "QUANTITY", "UNIT PRICE", "SUBTOTAL"].map((heading) => (
                          <th
                            key={heading}
                            scope="col"
                            style={{
                              padding: "12px 14px",
                              borderBottom: "1px solid #eadfce",
                              color: "#918782",
                              fontSize: 10,
                              fontWeight: 600,
                              letterSpacing: 1,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => {
                        const draft = draftItems.find(
                          (draftItem) => draftItem.rowId === item.id
                        );

                        return (
                        <tr key={item.id}>
                          <td style={{ padding: 14, borderBottom: "1px solid #eee4d7", color: "#332825", fontSize: 12 }}>
                            <strong>{item.product_name || "—"}</strong>
                            <span style={{ display: "block", marginTop: 4, color: "#918782" }}>
                              Product ID: {item.product_id || "—"}
                            </span>
                            {item.product_sku && (
                              <span style={{ display: "block", marginTop: 3, color: "#918782" }}>
                                SKU: {item.product_sku}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: 14, borderBottom: "1px solid #eee4d7", color: "#766c67", fontSize: 12 }}>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              aria-label={`Quantity for ${item.product_name || "order item"}`}
                              value={draft?.quantity ?? item.quantity}
                              onChange={(event) => {
                                setItemsError("");
                                setItemsMessage("");
                                setDraftItems((currentDrafts) =>
                                  currentDrafts.map((draftItem) =>
                                    draftItem.rowId === item.id
                                      ? { ...draftItem, quantity: event.target.value }
                                      : draftItem
                                  )
                                );
                              }}
                              disabled={savingItems}
                              style={{
                                width: 76,
                                minHeight: 36,
                                padding: "0 8px",
                                border: "1px solid #ded5ca",
                                borderRadius: 6,
                                background: "#fffdf8",
                                color: "#332825",
                                fontFamily: "inherit",
                                fontSize: 12,
                              }}
                            />
                          </td>
                          <td style={{ padding: 14, borderBottom: "1px solid #eee4d7", color: "#766c67", fontSize: 12, whiteSpace: "nowrap" }}>
                            {formatAmount(item.unit_price)}
                          </td>
                          <td style={{ padding: 14, borderBottom: "1px solid #eee4d7", color: "#332825", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                            {formatAmount(item.subtotal)}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No order items are available.</p>
              )}
              {Array.isArray(order.items) && order.items.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={handleItemSave}
                    disabled={
                      savingItems ||
                      !hasItemQuantityChanges ||
                      !itemQuantitiesValid
                    }
                    style={{
                      minHeight: 40,
                      padding: "0 16px",
                      border: 0,
                      borderRadius: 7,
                      background: "#651b2e",
                      color: "#fff",
                      fontFamily: "inherit",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: savingItems ? "wait" : "pointer",
                      opacity:
                        savingItems ||
                        !hasItemQuantityChanges ||
                        !itemQuantitiesValid
                          ? 0.6
                          : 1,
                    }}
                  >
                    {savingItems ? "Saving changes..." : "Save Changes"}
                  </button>
                  {!itemQuantitiesValid && (
                    <p role="alert" style={{ margin: "10px 0 0", color: "#9a3c3c", fontSize: 12 }}>
                      Each item quantity must be a whole number of at least 1.
                    </p>
                  )}
                  {itemsError && (
                    <p role="alert" style={{ margin: "10px 0 0", color: "#9a3c3c", fontSize: 12 }}>
                      {itemsError}
                    </p>
                  )}
                  {itemsMessage && (
                    <p role="status" style={{ margin: "10px 0 0", color: "#47704f", fontSize: 12 }}>
                      {itemsMessage}
                    </p>
                  )}
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminPagination from "@/components/admin/AdminPagination";
import { getAdminOrdersPage } from "@/services/orderService";

import "../admin.css";
import "./orders.css";

const statusLabels = {
	placed: "Placed",
	under_review: "Under Review",
	confirmed: "Confirmed",
	shipped: "Shipped",
};

const statusColors = {
	placed: { background: "#f1e5d0", color: "#7a6031" },
	under_review: { background: "#fff3d9", color: "#8a641d" },
	confirmed: { background: "#edf4ed", color: "#47704f" },
	shipped: { background: "#e8eff7", color: "#405f80" },
};

function getOrdersErrorMessage(error) {
	const status = error.response?.status;

	if (status === 401) return "Your admin session is missing or has expired.";
	if (status === 403) return "You do not have permission to view orders.";
	if (status === 404) return "The orders resource was not found.";
	if (status === 422) return "The server could not process the orders request.";
	if (error.request && !error.response) {
		return "Unable to connect to the server. Please try again.";
	}
	if (status >= 500) {
		return "The server could not load orders. Please try again.";
	}

	return "Unable to load orders. Please try again.";
}

function formatAmount(order) {
	const amount = order.final_amount ?? order.total_amount ?? order.subtotal;
	if (amount == null) return "—";

	const numericAmount = Number(amount);
	return Number.isFinite(numericAmount)
		? `₹${numericAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
		: "—";
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

function getItemCount(items) {
	if (!Array.isArray(items)) return "—";

	return items.reduce((count, item) => count + (Number(item.quantity) || 0), 0);
}

export default function AdminOrdersPage() {
	const [orders, setOrders] = useState([]);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let cancelled = false;

		async function loadOrders() {
			setLoading(true);
			setError("");
			try {
				const data = await getAdminOrdersPage({
					offset: (page - 1) * pageSize,
					limit: pageSize,
				});
				if (cancelled) return;
				setOrders(Array.isArray(data.items) ? data.items : []);
				setTotal(Number(data.total) || 0);
			} catch (requestError) {
				if (!cancelled) setError(getOrdersErrorMessage(requestError));
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		loadOrders();
		return () => {
			cancelled = true;
		};
	}, [page, pageSize]);

	return (
		<div className="admin-layout">
			<AdminSidebar />

			<main className="admin-main">
				<div className="admin-page-header">
					<span className="admin-eyebrow">STORE MANAGEMENT</span>
					<h1>Orders</h1>
					<p>Review customer orders and their current status.</p>
				</div>

				<section className="admin-card" aria-label="Orders list">
					{loading ? (
						<div className="admin-empty-activity" role="status">
							<h3>Loading orders...</h3>
						</div>
					) : error ? (
						<div className="admin-empty-activity" role="alert">
							<h3>{error}</h3>
						</div>
					) : orders.length === 0 ? (
						<div className="admin-empty-activity">
							<div className="admin-empty-icon">◫</div>
							<h3>No orders found.</h3>
							<p>Orders received from customers will appear here.</p>
						</div>
					) : (
						<div style={{ overflowX: "auto" }}>
							<table
								style={{
									width: "100%",
									minWidth: 920,
									borderCollapse: "collapse",
									textAlign: "left",
								}}
							>
								<thead>
									<tr>
										{["ORDER", "CUSTOMER", "ITEMS", "TOTAL", "STATUS", "DATE", "DETAILS"].map(
											(heading) => (
												<th
													key={heading}
													scope="col"
													style={{
														padding: "14px 16px",
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
											)
										)}
									</tr>
								</thead>
								<tbody>
									{orders.map((order) => {
										const rawStatus = String(order.status || "").toLowerCase();
										const statusStyle = statusColors[rawStatus] || {
											background: "#f1e5d0",
											color: "#62554e",
										};

										return (
											<tr key={order.id}>
												<td
													style={{
														padding: "16px",
														borderBottom: "1px solid #eee4d7",
														color: "#332825",
														fontSize: 12,
														fontWeight: 600,
														whiteSpace: "nowrap",
													}}
												>
													{order.id || "—"}
												</td>
												<td
													style={{
														padding: "16px",
														borderBottom: "1px solid #eee4d7",
														color: "#332825",
														fontSize: 12,
													}}
												>
													<strong style={{ display: "block", fontWeight: 600 }}>
														{order.customer_name || "—"}
													</strong>
													<span style={{ display: "block", marginTop: 4, color: "#766c67" }}>
														{order.customer_phone || "—"}
													</span>
													{order.customer_email && (
														<span style={{ display: "block", marginTop: 3, color: "#918782" }}>
															{order.customer_email}
														</span>
													)}
												</td>
												<td
													style={{
														padding: "16px",
														borderBottom: "1px solid #eee4d7",
														color: "#766c67",
														fontSize: 12,
														whiteSpace: "nowrap",
													}}
												>
													{getItemCount(order.items)}
												</td>
												<td
													style={{
														padding: "16px",
														borderBottom: "1px solid #eee4d7",
														color: "#332825",
														fontSize: 12,
														fontWeight: 600,
														whiteSpace: "nowrap",
													}}
												>
													{formatAmount(order)}
												</td>
												<td className="orders-status-cell" style={{ padding: "16px", borderBottom: "1px solid #eee4d7" }}>
													<span
														className="orders-status-badge"
														style={{
															background: statusStyle.background,
															color: statusStyle.color,
														}}
													>
														{statusLabels[rawStatus] || order.status || "—"}
													</span>
												</td>
												<td
													style={{
														padding: "16px",
														borderBottom: "1px solid #eee4d7",
														color: "#766c67",
														fontSize: 12,
														whiteSpace: "nowrap",
													}}
												>
													{formatDate(order.created_at)}
												</td>
												<td style={{ padding: "16px", borderBottom: "1px solid #eee4d7" }}>
													<Link
														href={`/admin/orders/${order.id}`}
														className="orders-details-link"
													>
														Details
													</Link>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
					{!loading && !error && (
						<AdminPagination
							page={page}
							pageSize={pageSize}
							total={total}
							onPageChange={setPage}
							onPageSizeChange={(size) => {
								setPageSize(size);
								setPage(1);
							}}
						/>
					)}
				</section>
			</main>
		</div>
	);
}

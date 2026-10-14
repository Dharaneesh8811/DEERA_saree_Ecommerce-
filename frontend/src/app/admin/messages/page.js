"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mail,
  MailOpen,
  MessageSquare,
  Search,
  X,
} from "lucide-react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  getAdminMessage,
  getAdminMessagesPage,
  updateAdminMessageStatus,
} from "@/services/messageService";

import "../admin.css";
import "./messages.css";

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

function getMessageError(error) {
  return (
    error.userMessage ||
    error.response?.data?.detail ||
    "Unable to load messages. Please try again."
  );
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getAdminMessagesPage({
          query: search,
          status: statusFilter,
          offset: (page - 1) * pageSize,
          limit: pageSize,
        });
        if (!cancelled) {
          const nextTotal = Number(data.total) || 0;
          const lastPage = Math.max(1, Math.ceil(nextTotal / pageSize));
          setTotal(nextTotal);
          if (page > lastPage) {
            setPage(lastPage);
          } else {
            setMessages(Array.isArray(data.items) ? data.items : []);
          }
        }
      } catch (loadError) {
        if (!cancelled) setError(getMessageError(loadError));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, statusFilter, page, pageSize]);

  async function refreshMessages() {
    try {
      const data = await getAdminMessagesPage({
        query: search,
        status: statusFilter,
        offset: (page - 1) * pageSize,
        limit: pageSize,
      });
      const nextTotal = Number(data.total) || 0;
      const lastPage = Math.max(1, Math.ceil(nextTotal / pageSize));
      setTotal(nextTotal);
      if (page > lastPage) {
        setPage(lastPage);
      } else {
        setMessages(Array.isArray(data.items) ? data.items : []);
      }
      setError("");
    } catch (loadError) {
      setError(getMessageError(loadError));
    }
  }

  async function openMessage(message) {
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    setSelectedMessage({ ...message, loading: true, detailError: "" });
    setSuccess("");

    try {
      let detail = await getAdminMessage(message.id);
      if (detail.status === "New") {
        detail = await updateAdminMessageStatus(message.id, "Read");
        setSuccess("Message marked as read.");
        await refreshMessages();
      }

      if (requestId.current === currentRequest) {
        setSelectedMessage({ ...detail, loading: false, detailError: "" });
      }
    } catch (detailError) {
      if (requestId.current === currentRequest) {
        setSelectedMessage((current) =>
          current
            ? {
                ...current,
                loading: false,
                detailError: getMessageError(detailError),
              }
            : current
        );
      }
    }
  }

  function closeMessage() {
    requestId.current += 1;
    setSelectedMessage(null);
  }

  async function changeStatus() {
    if (!selectedMessage || updatingStatus) return;

    const nextStatus = selectedMessage.status === "Read" ? "New" : "Read";
    setUpdatingStatus(true);
    setSuccess("");

    try {
      const updatedMessage = await updateAdminMessageStatus(
        selectedMessage.id,
        nextStatus
      );
      setSelectedMessage({ ...updatedMessage, loading: false, detailError: "" });
      setSuccess(`Message marked as ${nextStatus.toLowerCase()}.`);
      await refreshMessages();
    } catch (statusError) {
      setSelectedMessage((current) =>
        current
          ? { ...current, detailError: getMessageError(statusError) }
          : current
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  function messagePreview(message) {
    return message.message_preview || "";
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main messages-main">
        <div className="admin-page-header">
          <span className="admin-eyebrow">STORE MANAGEMENT</span>
          <h1>Messages</h1>
          <p>Read and manage messages sent by your customers.</p>
        </div>

        <section className="messages-panel admin-card" aria-label="Customer messages">
          <div className="messages-toolbar">
            <label className="messages-search">
              <Search size={17} aria-hidden="true" />
              <span className="messages-visually-hidden">Search messages</span>
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search name, email, subject or message"
              />
            </label>

            <label className="messages-filter">
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All messages</option>
                <option value="New">New</option>
                <option value="Read">Read</option>
              </select>
            </label>
          </div>

          {success && (
            <div className="messages-alert messages-alert-success" role="status">
              {success}
            </div>
          )}

          {loading ? (
            <div className="messages-state" role="status">
              <span className="messages-spinner" aria-hidden="true" />
              <h2>Loading messages...</h2>
              <p>Fetching the latest messages from your store.</p>
            </div>
          ) : error ? (
            <div className="messages-state" role="alert">
              <MessageSquare size={27} aria-hidden="true" />
              <h2>Messages could not be loaded</h2>
              <p>{error}</p>
              <button
                type="button"
                className="messages-retry-button"
                onClick={() => {
                  setLoading(true);
                  refreshMessages().finally(() => setLoading(false));
                }}
              >
                Try again
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="messages-state">
              <MailOpen size={27} aria-hidden="true" />
              <h2>{search || statusFilter ? "No matching messages" : "No messages yet"}</h2>
              <p>
                {search || statusFilter
                  ? "Try another search term or status filter."
                  : "Messages submitted through the customer contact form will appear here."}
              </p>
            </div>
          ) : (
            <>
              <div className="messages-table-wrap">
                <table className="messages-table">
                  <thead>
                    <tr>
                      <th scope="col">SENDER</th>
                      <th scope="col">SUBJECT & MESSAGE</th>
                      <th scope="col">RECEIVED</th>
                      <th scope="col">STATUS</th>
                      <th scope="col"><span className="messages-visually-hidden">Action</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((message) => (
                      <tr
                        key={message.id}
                        className={message.status === "New" ? "message-row-new" : ""}
                      >
                        <td>
                          <strong>{message.name}</strong>
                          <span className="messages-secondary">{message.email}</span>
                        </td>
                        <td>
                          <strong className="message-subject">
                            {message.subject || "No subject"}
                          </strong>
                          <span className="messages-preview">{messagePreview(message)}</span>
                        </td>
                        <td className="messages-date">{formatDate(message.created_at)}</td>
                        <td>
                          <span className={`message-status message-status-${message.status.toLowerCase()}`}>
                            {message.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="message-open-button"
                            onClick={() => openMessage(message)}
                            aria-label={`Open message from ${message.name}`}
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="messages-mobile-list">
                {messages.map((message) => (
                  <button
                    type="button"
                    key={message.id}
                    className={`message-mobile-card ${
                      message.status === "New" ? "message-mobile-card-new" : ""
                    }`}
                    onClick={() => openMessage(message)}
                  >
                    <span className="message-mobile-heading">
                      <strong>{message.name}</strong>
                      <span className={`message-status message-status-${message.status.toLowerCase()}`}>
                        {message.status}
                      </span>
                    </span>
                    <span className="messages-secondary">{message.email}</span>
                    <strong className="message-subject">
                      {message.subject || "No subject"}
                    </strong>
                    <span className="messages-preview">{messagePreview(message)}</span>
                    <span className="messages-mobile-date">{formatDate(message.created_at)}</span>
                  </button>
                ))}
              </div>
            </>
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

      {selectedMessage && (
        <div
          className="message-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeMessage();
          }}
        >
          <section
            className="message-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-modal-title"
          >
            <header className="message-modal-header">
              <div>
                <span className="admin-eyebrow">CUSTOMER MESSAGE</span>
                <h2 id="message-modal-title">
                  {selectedMessage.subject || "No subject"}
                </h2>
              </div>
              <button
                type="button"
                className="message-modal-close"
                onClick={closeMessage}
                aria-label="Close message"
              >
                <X size={19} />
              </button>
            </header>

            {selectedMessage.loading ? (
              <div className="message-modal-state" role="status">
                <span className="messages-spinner" aria-hidden="true" />
                Loading message...
              </div>
            ) : (
              <>
                <div className="message-sender">
                  <span className="message-sender-icon">
                    <Mail size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{selectedMessage.name}</strong>
                    <a href={`mailto:${selectedMessage.email}`}>
                      {selectedMessage.email}
                    </a>
                  </div>
                  <time>{formatDate(selectedMessage.created_at)}</time>
                </div>

                {selectedMessage.detailError && (
                  <div className="messages-alert messages-alert-error" role="alert">
                    {selectedMessage.detailError}
                  </div>
                )}
                <div className="message-full-content">
                  {selectedMessage.message || "The full message could not be loaded."}
                </div>

                <footer className="message-modal-footer">
                  <span className={`message-status message-status-${selectedMessage.status.toLowerCase()}`}>
                    {selectedMessage.status}
                  </span>
                  <button
                    type="button"
                    className="message-status-button"
                    onClick={changeStatus}
                    disabled={updatingStatus || Boolean(selectedMessage.detailError)}
                  >
                    {selectedMessage.status === "Read" ? "Mark as new" : "Mark as read"}
                  </button>
                </footer>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

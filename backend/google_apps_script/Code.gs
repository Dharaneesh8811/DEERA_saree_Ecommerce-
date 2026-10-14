const SHARED_SECRET_PROPERTY = "ORDER_EMAIL_SHARED_SECRET";
const DEDUPLICATION_TTL_SECONDS = 21600;

function doPost(e) {
  let lock;
  try {
    const body = JSON.parse(e.postData.contents);
    const expectedSecret = PropertiesService.getScriptProperties()
      .getProperty(SHARED_SECRET_PROPERTY);

    if (!expectedSecret || !body || body.secret !== expectedSecret) {
      return jsonResponse({ success: false, error: "Unauthorized" });
    }

    validatePayload(body);
    lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) {
      return jsonResponse({ success: false, error: "Please retry later" });
    }

    const cache = CacheService.getScriptCache();
    const cacheKey = "sent_" + digestEventId(body.event_id);
    if (cache.get(cacheKey)) {
      return jsonResponse({ success: true, duplicate: true });
    }

    MailApp.sendEmail({
      to: body.customer_email,
      subject: emailSubject(body),
      body: plainTextEmail(body),
      htmlBody: htmlEmail(body),
      name: "Deera Silks"
    });
    cache.put(cacheKey, "1", DEDUPLICATION_TTL_SECONDS);

    return jsonResponse({ success: true, duplicate: false });
  } catch (error) {
    console.error("Order email notification failed: " + error.message);
    return jsonResponse({ success: false, error: "Notification failed" });
  } finally {
    if (lock && lock.hasLock()) {
      lock.releaseLock();
    }
  }
}

function validatePayload(body) {
  if (body.event !== "order_placed" && body.event !== "order_status_updated") {
    throw new Error("Unsupported event");
  }

  ["event_id", "order_id", "order_number", "customer_name", "customer_email",
    "total_amount", "status"].forEach(function (field) {
      if (typeof body[field] !== "string" || !body[field].trim()) {
        throw new Error("Missing required field");
      }
    });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer_email)) {
    throw new Error("Invalid customer email");
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new Error("Order items are required");
  }
  body.items.forEach(function (item) {
    if (!item || typeof item.product_name !== "string" ||
        !item.product_name.trim() || !Number.isInteger(item.quantity) ||
        item.quantity < 1 || typeof item.unit_price !== "string" ||
        typeof item.subtotal !== "string") {
      throw new Error("Invalid order item");
    }
  });

  if (body.event === "order_status_updated" &&
      (typeof body.previous_status !== "string" ||
       !body.previous_status.trim() ||
       typeof body.new_status !== "string" ||
       !body.new_status.trim() ||
       body.new_status !== body.status ||
       body.new_status === body.previous_status)) {
    throw new Error("Invalid order status change");
  }
}

function emailSubject(body) {
  if (body.event === "order_placed") {
    return "Deera Silks order confirmation - " + body.order_number;
  }
  return "Deera Silks order update - " + body.order_number;
}

function plainTextEmail(body) {
  const lines = [
    "DEERA SILKS",
    "A tradition of timeless elegance",
    "",
    "Hello " + body.customer_name + ",",
    "",
    body.event === "order_placed"
      ? "Thank you for your order."
      : "There is an update to your order.",
    "Order: " + body.order_number,
    ""
  ];

  if (body.event === "order_status_updated") {
    lines.push(
      "Previous status: " + body.previous_status,
      "New status: " + body.new_status,
      ""
    );
  } else {
    lines.push("Status: " + body.status);
  }

  lines.push("", "ORDER DETAILS", "---------------");
  body.items.forEach(function (item) {
    lines.push(
      "- " + item.product_name + " x " + item.quantity +
      " @ " + item.unit_price + " - " + item.subtotal
    );
  });
  lines.push(
    "",
    "Subtotal: " + body.subtotal,
    "Shipping: " + body.shipping_fee,
    "Discount: -" + body.discount_amount,
    "TOTAL: " + body.total_amount,
    "",
    "Thank you for choosing Deera Silks."
  );
  return lines.join("\n");
}

function htmlEmail(body) {
  const greeting = escapeHtml(body.customer_name);
  const orderNumber = escapeHtml(body.order_number);
  const rows = body.items.map(function (item) {
    return "<tr>" +
      "<td style=\"padding:12px 10px;border-bottom:1px solid #eee7dc;" +
      "color:#241a18;font-size:14px;\">" +
      escapeHtml(item.product_name) + "</td>" +
      "<td style=\"padding:12px 10px;border-bottom:1px solid #eee7dc;" +
      "color:#5f5752;text-align:center;font-size:14px;\">" +
      escapeHtml(item.quantity) + "</td>" +
      "<td style=\"padding:12px 10px;border-bottom:1px solid #eee7dc;" +
      "color:#5f5752;text-align:right;font-size:14px;\">" +
      escapeHtml(item.unit_price) + "</td>" +
      "<td style=\"padding:12px 10px;border-bottom:1px solid #eee7dc;" +
      "color:#241a18;text-align:right;font-size:14px;font-weight:bold;\">" +
      escapeHtml(item.subtotal) + "</td></tr>";
  }).join("");

  let statusDetails;
  if (body.event === "order_status_updated") {
    statusDetails = "<span style=\"display:inline-block;padding:7px 11px;" +
      "border-radius:20px;background-color:#f1e5d0;color:#651b2e;" +
      "font-size:12px;font-weight:bold;\">" +
      escapeHtml(body.previous_status) + " &rarr; " +
      escapeHtml(body.new_status) + "</span>";
  } else {
    statusDetails = "<span style=\"display:inline-block;padding:7px 11px;" +
      "border-radius:20px;background-color:#f1e5d0;color:#651b2e;" +
      "font-size:12px;font-weight:bold;\">" +
      escapeHtml(body.status) + "</span>";
  }

  const summaryRows = [
    ["Subtotal", body.subtotal],
    ["Shipping", body.shipping_fee],
    ["Discount", "-" + body.discount_amount]
  ].map(function (row) {
    return "<tr><td style=\"padding:5px 0;color:#5f5752;font-size:14px;\">" +
      escapeHtml(row[0]) + "</td><td style=\"padding:5px 0;color:#241a18;" +
      "text-align:right;font-size:14px;\">" + escapeHtml(row[1]) +
      "</td></tr>";
  }).join("");

  return "<div style=\"margin:0;padding:28px 12px;background-color:#faf6ee;" +
    "font-family:Arial,Helvetica,sans-serif;color:#241a18;\">" +
    "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" " +
    "style=\"width:100%;max-width:620px;margin:0 auto;background-color:#fffdf8;" +
    "border:1px solid #eee7dc;border-collapse:collapse;\">" +
    "<tr><td style=\"padding:28px 24px;text-align:center;" +
    "background-color:#651b2e;border-bottom:4px solid #c6a15b;\">" +
    "<div style=\"font-family:Georgia,'Times New Roman',serif;color:#fffdf8;" +
    "font-size:25px;letter-spacing:3px;\">DEERA SILKS</div>" +
    "<div style=\"margin-top:7px;color:#f1e5d0;font-size:11px;" +
    "letter-spacing:2px;text-transform:uppercase;\">" +
    "A tradition of timeless elegance</div></td></tr>" +
    "<tr><td style=\"padding:32px 28px 12px;\">" +
    "<div style=\"color:#651b2e;font-family:Georgia,'Times New Roman',serif;" +
    "font-size:25px;line-height:1.3;\">" +
    (body.event === "order_placed"
      ? "Thank you for your order"
      : "Your order has been updated") +
    "</div><p style=\"margin:16px 0 6px;font-size:15px;\">Hello " +
    greeting + ",</p><p style=\"margin:0;color:#5f5752;font-size:14px;" +
    "line-height:1.7;\">" +
    (body.event === "order_placed"
      ? "We are delighted you chose Deera Silks. Here is a summary of your purchase."
      : "There is a new update on your Deera Silks order.") +
    "</p></td></tr>" +
    "<tr><td style=\"padding:16px 28px 22px;\">" +
    "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" " +
    "style=\"width:100%;background-color:#faf6ee;border:1px solid #eee7dc;\">" +
    "<tr><td style=\"padding:15px 16px;\">" +
    "<div style=\"color:#8a7d72;font-size:10px;letter-spacing:1.5px;" +
    "text-transform:uppercase;\">Order reference</div>" +
    "<div style=\"margin-top:5px;color:#241a18;font-size:16px;" +
    "font-weight:bold;\">" + orderNumber + "</div></td>" +
    "<td style=\"padding:15px 16px;text-align:right;\">" +
    "<div style=\"margin-bottom:7px;color:#8a7d72;font-size:10px;" +
    "letter-spacing:1.5px;text-transform:uppercase;\">Status</div>" +
    statusDetails + "</td></tr></table></td></tr>" +
    "<tr><td style=\"padding:0 28px 8px;\">" +
    "<div style=\"color:#651b2e;font-family:Georgia,'Times New Roman',serif;" +
    "font-size:18px;\">Order details</div>" +
    "<table cellpadding=\"0\" cellspacing=\"0\" " +
    "style=\"width:100%;margin-top:12px;border-collapse:collapse;\">" +
    "<thead><tr style=\"background-color:#f1e5d0;\">" +
    "<th style=\"padding:10px;text-align:left;color:#651b2e;font-size:11px;" +
    "letter-spacing:.5px;text-transform:uppercase;\">Item</th>" +
    "<th style=\"padding:10px;text-align:center;color:#651b2e;font-size:11px;" +
    "letter-spacing:.5px;text-transform:uppercase;\">Qty</th>" +
    "<th style=\"padding:10px;text-align:right;color:#651b2e;font-size:11px;" +
    "letter-spacing:.5px;text-transform:uppercase;\">Price</th>" +
    "<th style=\"padding:10px;text-align:right;color:#651b2e;font-size:11px;" +
    "letter-spacing:.5px;text-transform:uppercase;\">Amount</th>" +
    "</tr></thead><tbody>" + rows + "</tbody></table>" +
    "<table cellpadding=\"0\" cellspacing=\"0\" " +
    "style=\"width:100%;max-width:300px;margin:16px 0 0 auto;" +
    "border-collapse:collapse;\">" + summaryRows +
    "<tr><td colspan=\"2\" style=\"padding-top:10px;" +
    "border-top:1px solid #c6a15b;\"></td></tr>" +
    "<tr><td style=\"padding:5px 0;color:#651b2e;font-size:15px;" +
    "font-weight:bold;\">Total</td>" +
    "<td style=\"padding:5px 0;color:#651b2e;text-align:right;" +
    "font-size:17px;font-weight:bold;\">" +
    escapeHtml(body.total_amount) + "</td></tr></table></td></tr>" +
    "<tr><td style=\"padding:22px 28px 28px;\">" +
    "<div style=\"height:1px;background-color:#eee7dc;\"></div>" +
    "<p style=\"margin:18px 0 0;color:#5f5752;text-align:center;" +
    "font-family:Georgia,'Times New Roman',serif;font-size:15px;" +
    "font-style:italic;\">Thank you for choosing Deera Silks.</p>" +
    "</td></tr></table></div>";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[character];
  });
}

function digestEventId(eventId) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    eventId,
    Utilities.Charset.UTF_8
  );
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, "");
}

function jsonResponse(body) {
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

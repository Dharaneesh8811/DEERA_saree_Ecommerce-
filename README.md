# Deera Silks 🥻

A modern full-stack e-commerce platform for premium silk sarees, built with Next.js, React, FastAPI, PostgreSQL, and RustFS.

Deera Silks provides a premium shopping experience for customers along with an admin dashboard for managing products, categories, images, coupons, inventory, and orders.

---

## ✨ Features

### Customer

- 🏠 Premium and responsive storefront
- 🛍️ Product collections and categories
- 🔎 Product search, filtering, sorting and pagination
- 🖼️ Product image gallery
- ❤️ Wishlist
- 🛒 Shopping cart
- 🎟️ Coupon and discount system
- 📦 Checkout and order placement
- 📋 Order status
- 🔄 Return & Exchange information
- 📖 About, FAQ, Journal and Contact pages
- 📱 Fully responsive design

### Admin

- 🔐 Secure admin authentication
- 📦 Product management
- 🗂️ Category management
- 🖼️ Product image management
- 📊 Inventory and variant management
- 🎟️ Coupon management
- 🛒 Order management
- 📄 Product pagination and filtering
- ⚡ Product activation/deactivation
- 🎞️ Admin-managed homepage hero image

---

## 🛠️ Tech Stack

### Frontend

- Next.js
- React
- JavaScript
- Tailwind CSS
- Axios

### Backend

- Python
- FastAPI
- SQLAlchemy
- REST API

### Database & Storage

- PostgreSQL
- RustFS (S3-compatible object storage)

### Tools

- Git
- GitHub
- VS Code

---

## 🏗️ Architecture

Customer / Admin
       │
       ▼
 Next.js + React
       │
       │ REST API
       ▼
     FastAPI
       │
   ┌───┴────┐
   ▼        ▼
PostgreSQL  RustFS
 Database   Images

## Homepage hero image

The homepage displays one active hero image. Admins can preview and replace it
at `/admin/hero-slides`; **Update Image** selects a file, and **Save Changes**
uploads it through the authenticated `POST /api/hero/upload` endpoint. The
image is stored in the existing S3-compatible storage and its URL remains in
the existing hero database record. Cancel discards the pending selection.

The public `GET /api/hero/` endpoint returns the active hero image and its
existing text/button content. Older `/api/hero-slides/` endpoints and database
records remain available for compatibility, but the homepage and admin UI no
longer expose carousel or slide-management controls.

If an upload returns `502`, check the backend log for the S3 error code. An
`InvalidAccessKeyId` response means the backend's configured
`S3_ACCESS_KEY_ID` is not recognized by RustFS; configure a valid matching
access/secret key pair and restart the backend. The admin page reports storage
failures without exposing credential details.

Apply the `6e4c4d9a18b2` Alembic migration after the existing migrations to
add slide content and ordering to the current hero records without deleting
their images.

## Order email notifications

Order confirmation and status-update emails are sent through the Google Apps
Script web app in `backend/google_apps_script/Code.gs`. The backend sends
notifications only after the database commit succeeds. Notification failures
are logged without undoing the order or status change.

### Configure and deploy

1. In Google Apps Script, create a project and copy the contents of
   `backend/google_apps_script/Code.gs` into `Code.gs`.
2. In **Project Settings → Script Properties**, add
   `ORDER_EMAIL_SHARED_SECRET` with a long, randomly generated secret.
3. Select **Deploy → New deployment → Web app**. Set **Execute as** to **Me**
   and **Who has access** to **Anyone**, then deploy and authorize email
   sending. Copy the deployment URL ending in `/exec`.
4. Set these variables in the backend environment (for example,
   `backend/.env`):

   ```env
   APPS_SCRIPT_EMAIL_NOTIFICATION_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
   APPS_SCRIPT_EMAIL_NOTIFICATION_SECRET=the-same-random-secret
   ```

5. Restart the backend. Do not put the shared secret in frontend configuration
   or commit it to source control. Each event has a stable event ID; Apps Script
   uses a short-lived cache to reduce duplicate emails on request retries.

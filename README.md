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

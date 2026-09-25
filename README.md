# PhonesDaddy — Mobile Phone Specifications Website

PhonesDaddy is a fast, responsive, modern mobile phone specifications web application built with Node.js, Express.js, MySQL, and clean Vanilla HTML5/CSS3/JavaScript.

## Features

- **Dynamic Homepage (`/`)**:
  - Live search with debounced autocomplete dropdown.
  - Interactive brand pills strip.
  - Latest mobiles, Popular mobiles, and Upcoming mobiles grids.
  - Quick side-by-side phone comparison launcher.
  - Latest specification updates ticker.
- **Phone Catalog & Filtering (`/phones`)**:
  - Filter by Brands (checkboxes with count).
  - Price range min/max filter.
  - RAM filtering (4GB, 6GB, 8GB, 12GB, 16GB+).
  - Internal Storage filtering (128GB, 256GB, 512GB, 1TB).
  - 5G connectivity filter.
  - Sort by Newest, Most Popular, Price (Low to High, High to Low), and Name.
  - Full pagination controls and lazy-loaded imagery.
- **Comprehensive Phone Detail (`/phone/:slug`)**:
  - Server-side injected SEO title, meta descriptions, and canonical URLs.
  - Schema.org `Product` JSON-LD structured data.
  - Multi-currency retail price table (Pakistan PKR, USA USD, UAE AED, India INR, UK GBP).
  - Complete specifications table organized into standard categories:
    - *Network, Launch, Body, Display, Platform, Memory, Main Camera, Selfie Camera, Sound, Connectivity, Features, Battery, Price*.
  - Related models from the same brand.
  - Quick "Add to Compare" button.
- **Brand Pages (`/brands` & `/brand/:slug`)**:
  - Listing of all registered manufacturers with model counts.
  - Dedicated brand page showing brand overview, logo, and all brand models.
- **Comparison Matrix (`/compare`)**:
  - Side-by-side spec comparison of 2, 3, or 4 devices.
  - Live autocomplete search to dynamically add phones to comparison.
  - Remove phone button and shareable URL query parameters (`/compare?phones=slug1,slug2`).
- **Administration Portal (`/admin`)**:
  - Protected admin session with bcrypt password hashing and login rate limiting.
  - Dashboard overview showing total phones, brands, views, and news.
  - Phone Manager with search, edit, delete, and "+ Add New Phone".
  - Dynamic Specification Builder (allows adding/editing/reordering custom rows in any section).
  - Brand Manager with modal dialog for creating, editing, and uploading brand logos.
  - **Site Settings & Ad Management (`/admin/settings`)**:
    - Easily inject custom `<head>` snippet codes (Google AdSense, Google Analytics GA4, Adsterra, custom meta tags, search verification tokens, tracking pixels) across all public pages.
    - One-click snippet presets for AdSense, GA4, Adsterra, Meta Pixel, and Search Console.
    - Enable/disable toggles without losing saved scripts.
    - Live `<head>` output preview and optional `<body>` closing snippets.
- **SEO & Search Feeds**:
  - Dynamic XML Sitemap at `/sitemap.xml`.
  - Crawler directives at `/robots.txt`.

---

## Technology Stack

- **Backend**: Node.js, Express.js (REST APIs)
- **Database**: MySQL (MariaDB) with relational tables (`brands`, `phones`, `phone_specs`, `phone_prices`, `admins`, `news`) and indexed lookups.
- **Security**: Helmet, CORS, express-rate-limit, parameterized SQL queries (`mysql2/promise`), bcrypt password hashing, HTTP-only session cookies.
- **Image Storage**: Local server disk storage (`/uploads/phones/` and `/uploads/brands/`) with MIME type validation.
- **Frontend**: Vanilla HTML5, CSS3, and JavaScript (Zero frontend framework dependencies).

---

## Default Credentials

- **Admin Login URL**: `http://localhost:3000/admin/login`
- **Username**: `admin`
- **Password**: `admin123`

---

## Quick Start (One-Click)

On Windows, simply double-click:
```
start-project.bat
```
*(Make sure MySQL is started first in XAMPP or Windows Services)*

---

## Setup & Running Manually

1. **Ensure MySQL is running** on `localhost:3306` (e.g. via XAMPP).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Seed Database** (First time only):
   ```bash
   npm run seed
   ```
4. **Start Web Server**:
   ```bash
   npm start
   ```
5. **Open in Browser**:
   - Website: `http://localhost:3000`
   - Catalog: `http://localhost:3000/phones`
   - Comparison: `http://localhost:3000/compare`
   - Brands: `http://localhost:3000/brands`
   - Admin Panel: `http://localhost:3000/admin` (Default: `admin` / `admin123`)

---

## 🎨 White-Label Rebranding & Resale Guide

This project is 100% white-label ready. When selling or transferring this project to a buyer, **no source code changes are required** to change the site identity:

1. Log into the Admin Panel at `/admin/login`.
2. Navigate to **⚙️ Settings → 🎨 Site Identity & Branding**.
3. Customize:
   - **Website / Brand Name**: Change to any site name (e.g. `MobilesWorld`, `TechRadarPk`).
   - **Site Tagline**: Change the slogan or regional target.
   - **Canonical Domain / URL**: Enter the buyer's live domain (e.g. `https://buyerdomain.com`).
   - **Website Header Logo**: Drag and drop a custom logo image (PNG, SVG, WEBP, JPG).
   - **Browser Favicon**: Drag and drop a custom `.ico` or `.png` icon.
   - **Footer Copyright & About Text**: Enter custom ownership text.
4. Click **💾 Save Settings**.

All 10 public pages, headers, footers, `<title>` tags, meta descriptions, OpenGraph social cards, XML sitemaps (`/sitemap.xml`), and Schema.org structured data will instantly update with the buyer's branding!


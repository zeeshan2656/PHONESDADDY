const express = require('express');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

// Route handlers
const phoneRoutes = require('./routes/phoneRoutes');
const brandRoutes = require('./routes/brandRoutes');
const searchRoutes = require('./routes/searchRoutes');
const compareRoutes = require('./routes/compareRoutes');
const authRoutes = require('./routes/authRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const newsRoutes = require('./routes/newsRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const pageRoutes = require('./routes/pageRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const viewRoutes = require('./routes/viewRoutes');

// Middleware
const { notFoundHandler, errorHandler } = require('./middleware/error');

const app = express();

// Trust reverse proxy (Hostinger, Cloudflare, Nginx, LiteSpeed, etc.)
app.set('trust proxy', 1);

// Request Logger
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allows clean inline scripts and fonts for Vanilla JS components
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

app.use(cors());

// Body Parsers — increased limits to handle rich blog content from Quill editor
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session Setup
app.use(session({
  name: 'phonesdaddy_session',
  secret: process.env.SESSION_SECRET || 'phonesdaddy_secret_key_3892749',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    httpOnly: true,
    secure: 'auto', // Automatically detects HTTPS via reverse proxy headers on Hostinger/Cloudflare
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Static Folders
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// REST API Endpoints
app.use('/api/phones', searchRoutes); // Handles /api/phones/search
app.use('/api/phones', phoneRoutes);   // Handles /api/phones, /latest, /slug/:slug
app.use('/api/brands', brandRoutes);   // Handles /api/brands, /slug/:slug
app.use('/api/compare', compareRoutes); // Handles /api/compare
app.use('/api/admin/auth', authRoutes); // Handles /api/admin/auth/login, etc.
app.use('/api/admin/settings', settingsRoutes); // Handles /api/admin/settings
app.use('/api/settings', settingsRoutes); // Handles /api/settings/public
app.use('/api/admin', authRoutes);
app.use('/api/news', newsRoutes); // Handles /api/news, /hot, /slug/:slug, and admin news
app.use('/api/reviews', reviewRoutes); // Handles /api/reviews/phone/:id
app.use('/api/comments', reviewRoutes); // Handles /api/comments/news/:id
app.use('/api/admin/reviews', reviewRoutes); // Handles /api/admin/reviews/list, stats, status, delete
app.use('/api/pages', pageRoutes); // Handles /api/pages/footer, /slug/:slug, /admin/*
app.use('/api/admin/pages', pageRoutes);
app.use('/api/categories', categoryRoutes); // Handles /api/categories, /admin/*
app.use('/api/admin/categories', categoryRoutes);


// View & Page Routes (HTML templates & SEO)
app.use('/', viewRoutes);

// Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const PhoneModel = require('../models/phoneModel');
const BrandModel = require('../models/brandModel');
const SettingsModel = require('../models/settingsModel');
const NewsModel = require('../models/newsModel');
const PageModel = require('../models/pageModel');
const { requireAdminAuth } = require('../middleware/auth');

const viewsDir = path.join(__dirname, '../../views');
const adminDir = path.join(__dirname, '../../admin');

/**
 * Helper to render HTML view with custom <head> and <body> snippets, and dynamic branding injected
 */
async function renderViewWithSnippets(res, templateFile, replacements = {}, statusCode = 200) {
  const filePath = path.join(viewsDir, templateFile);
  let html = fs.readFileSync(filePath, 'utf8');

  // Fetch dynamic branding
  let branding = {
    site_name: 'PhonesDaddy',
    site_tagline: 'Mobile Phone Specifications, Prices & Comparisons',
    site_description: 'Discover latest mobile phone prices in Pakistan, detailed technical specifications, camera benchmarks, battery life ratings, and phone comparisons.',
    site_url: 'http://localhost:3000',
    site_logo: '',
    site_favicon: '',
    footer_copyright: '© 2026 PhonesDaddy. All rights reserved. Clean, fast, and authentic mobile phone specifications.'
  };
  let headerLogoHtml = `<div class="brand-icon">P</div><span>Phones<span class="brand-highlight">Daddy</span></span>`;
  let footerLogoHtml = headerLogoHtml;
  let faviconTag = `<link rel="icon" type="image/svg+xml" href="/images/placeholder.svg">`;

  try {
    branding = await SettingsModel.getBranding();
    headerLogoHtml = await SettingsModel.getHeaderLogoHtml();
    footerLogoHtml = await SettingsModel.getFooterLogoHtml();
    faviconTag = await SettingsModel.getFaviconTag();
  } catch (brandErr) {
    console.error('Error fetching branding in view renderer:', brandErr);
  }

  // If footer_copyright has hardcoded PhonesDaddy and buyer changed site_name
  let footerCopyright = branding.footer_copyright || '';
  if (branding.site_name && branding.site_name !== 'PhonesDaddy') {
    footerCopyright = footerCopyright.replace(/PhonesDaddy/g, branding.site_name);
  }

  // Common branding replacements
  const commonReplacements = {
    '{{SITE_NAME}}': escapeHtml(branding.site_name),
    '{{SITE_TAGLINE}}': escapeHtml(branding.site_tagline),
    '{{SITE_DESCRIPTION}}': escapeHtml(branding.site_description),
    '{{SITE_URL}}': branding.site_url,
    '{{SITE_LOGO_URL}}': branding.site_logo || '/images/logo.png',
    '{{SITE_LOGO_HTML}}': headerLogoHtml,
    '{{SITE_FOOTER_LOGO_HTML}}': footerLogoHtml,
    '{{SITE_FAVICON_TAG}}': faviconTag,
    '{{FOOTER_COPYRIGHT}}': escapeHtml(footerCopyright),
    '{{FOOTER_ABOUT}}': escapeHtml(branding.site_description)
  };

  const allReplacements = { ...commonReplacements, ...replacements };

  for (const [key, val] of Object.entries(allReplacements)) {
    html = html.replace(new RegExp(key, 'g'), val);
  }

  // If buyer changed site_name, clean up any residual PhonesDaddy strings in the rendered page
  if (branding.site_name && branding.site_name !== 'PhonesDaddy') {
    html = html.replace(/PhonesDaddy/g, escapeHtml(branding.site_name));
  }

  // Ensure favicon is present in <head>
  if (html.includes('</head>')) {
    // If not already injected, add favicon right before </head>
    if (!html.includes('rel="icon"') && !html.includes("rel='icon'")) {
      html = html.replace('</head>', `\n  ${faviconTag}\n</head>`);
    }
  }

  // Inject Custom Head & Body Snippets (AdSense, Google Analytics, Adsterra, Meta Tags, etc.)
  try {
    const headCode = await SettingsModel.getCombinedHeadCode();
    if (headCode) {
      if (html.includes('</head>')) {
        html = html.replace('</head>', `\n<!-- Custom Head Snippets (AdSense / Analytics / Adsterra / Custom) -->\n${headCode}\n</head>`);
      } else {
        html = headCode + '\n' + html;
      }
    }

    const bodyCode = await SettingsModel.getCombinedBodyCode();
    if (bodyCode) {
      if (html.includes('</body>')) {
        html = html.replace('</body>', `\n<!-- Custom Body Snippets -->\n${bodyCode}\n</body>`);
      }
    }

    // Inject Custom Ad Placements (Google AdSense Units)
    const adPhoneTop = await SettingsModel.getAdSlotHtml('ad_phone_top', 'Sponsored');
    const adPhoneMid = await SettingsModel.getAdSlotHtml('ad_phone_mid', 'Advertisement');
    const adPhoneSpec2 = await SettingsModel.getAdSlotHtml('ad_phone_spec_2', 'Sponsored Spec Link');
    const adPhoneBottom = await SettingsModel.getAdSlotHtml('ad_phone_bottom', 'Sponsored Link');
    const adSidebarTop = await SettingsModel.getAdSlotHtml('ad_sidebar_top', 'Advertisement');
    const adSidebarBottom = await SettingsModel.getAdSlotHtml('ad_sidebar_bottom', 'Sponsored');
    const adArticleTop = await SettingsModel.getAdSlotHtml('ad_article_top', 'Advertisement');
    const adArticleMid = await SettingsModel.getAdSlotHtml('ad_article_mid', 'Sponsored');
    const adArticleBottom = await SettingsModel.getAdSlotHtml('ad_article_bottom', 'Advertisement');

    html = html
      .replace(/\{\{AD_PHONE_TOP\}\}/g, adPhoneTop)
      .replace(/\{\{AD_PHONE_MID\}\}/g, adPhoneMid)
      .replace(/\{\{AD_PHONE_SPEC_2\}\}/g, adPhoneSpec2)
      .replace(/\{\{AD_PHONE_BOTTOM\}\}/g, adPhoneBottom)
      .replace(/\{\{AD_SIDEBAR_TOP\}\}/g, adSidebarTop)
      .replace(/\{\{AD_SIDEBAR_BOTTOM\}\}/g, adSidebarBottom)
      .replace(/\{\{AD_ARTICLE_TOP\}\}/g, adArticleTop)
      .replace(/\{\{AD_ARTICLE_MID\}\}/g, adArticleMid)
      .replace(/\{\{AD_ARTICLE_BOTTOM\}\}/g, adArticleBottom);
  } catch (snippetErr) {
    console.error('Error injecting head/body snippets or ad placements:', snippetErr);
  }

  // Prevent browser from caching old branding when user changes settings
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.status(statusCode).send(html);
}

// Homepage
router.get('/', async (req, res, next) => {
  try {
    await renderViewWithSnippets(res, 'home.html');
  } catch (err) {
    next(err);
  }
});

// Phones Catalog / Listing
router.get('/phones', async (req, res, next) => {
  try {
    await renderViewWithSnippets(res, 'phones.html');
  } catch (err) {
    next(err);
  }
});

// Single Phone Detail Page (with Server-Side SEO & Schema.org Injection)
router.get('/phone/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const phone = await PhoneModel.getPhoneBySlug(slug);

    if (!phone) {
      return await renderViewWithSnippets(res, '404.html', {}, 404);
    }

    const branding = await SettingsModel.getBranding();
    const siteName = branding.site_name || 'PhonesDaddy';
    const siteUrl = branding.site_url || `${req.protocol}://${req.get('host')}`;

    let pageTitle = phone.meta_title || `${phone.name} Price in Pakistan & Specifications | ${siteName}`;
    let pageDescription = phone.meta_description || `${phone.name} price in Pakistan, specifications, display, camera, battery, processor, RAM, storage and other details.`;
    if (branding.site_name && branding.site_name !== 'PhonesDaddy') {
      pageTitle = pageTitle.replace(/PhonesDaddy/gi, branding.site_name);
      pageDescription = pageDescription.replace(/PhonesDaddy/gi, branding.site_name);
    }
    const canonicalUrl = `${siteUrl}/phone/${phone.slug}`;
    const fullImageUrl = phone.image ? (phone.image.startsWith('http') ? phone.image : `${siteUrl}${phone.image}`) : '';

    // Schema.org Product structured data
    const schemaData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": phone.name,
      "image": fullImageUrl,
      "description": phone.short_description || pageDescription,
      "brand": {
        "@type": "Brand",
        "name": phone.brand_name
      }
    };

    if (phone.price && parseFloat(phone.price) > 0) {
      schemaData.offers = {
        "@type": "Offer",
        "url": canonicalUrl,
        "priceCurrency": "PKR",
        "price": parseFloat(phone.price),
        "priceValidUntil": "2027-12-31",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": phone.status === 'Available' ? "https://schema.org/InStock" : "https://schema.org/PreOrder"
      };
    }

    const replacements = {
      '{{PAGE_TITLE}}': escapeHtml(pageTitle),
      '{{META_DESCRIPTION}}': escapeHtml(pageDescription),
      '{{CANONICAL_URL}}': canonicalUrl,
      '{{PHONE_NAME}}': escapeHtml(phone.name),
      '{{PHONE_SLUG}}': escapeHtml(phone.slug),
      '{{SCHEMA_JSON}}': JSON.stringify(schemaData, null, 2)
    };

    await renderViewWithSnippets(res, 'phone.html', replacements);
  } catch (err) {
    next(err);
  }
});

// Brands Listing
router.get('/brands', async (req, res, next) => {
  try {
    await renderViewWithSnippets(res, 'brands.html');
  } catch (err) {
    next(err);
  }
});

// Single Brand Page
router.get('/brand/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const brand = await BrandModel.getBrandBySlug(slug);

    if (!brand) {
      return await renderViewWithSnippets(res, '404.html', {}, 404);
    }

    const branding = await SettingsModel.getBranding();
    const siteName = branding.site_name || 'PhonesDaddy';
    const siteUrl = branding.site_url || `${req.protocol}://${req.get('host')}`;

    const pageTitle = `${brand.name} Mobile Phones, Latest Prices & Specifications | ${siteName}`;
    const pageDescription = `Browse all ${brand.name} smartphones with latest official prices, complete specs, and comparisons on ${siteName}.`;
    const canonicalUrl = `${siteUrl}/brand/${brand.slug}`;

    const replacements = {
      '{{PAGE_TITLE}}': escapeHtml(pageTitle),
      '{{META_DESCRIPTION}}': escapeHtml(pageDescription),
      '{{CANONICAL_URL}}': canonicalUrl,
      '{{BRAND_NAME}}': escapeHtml(brand.name),
      '{{BRAND_SLUG}}': escapeHtml(brand.slug)
    };

    await renderViewWithSnippets(res, 'brand.html', replacements);
  } catch (err) {
    next(err);
  }
});

// Phone Comparison Page
router.get('/compare', async (req, res, next) => {
  try {
    await renderViewWithSnippets(res, 'compare.html');
  } catch (err) {
    next(err);
  }
});

// News & Blog Listing Page
router.get('/news', async (req, res, next) => {
  try {
    await renderViewWithSnippets(res, 'news.html');
  } catch (err) {
    next(err);
  }
});

// Single News & Blog Post Page (with SEO & Schema.org NewsArticle Structured Data)
router.get('/news/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const article = await NewsModel.getBySlug(slug);

    if (!article || article.status !== 'published') {
      return await renderViewWithSnippets(res, '404.html', {}, 404);
    }

    const branding = await SettingsModel.getBranding();
    const siteName = branding.site_name || 'PhonesDaddy';
    const siteUrl = branding.site_url || `${req.protocol}://${req.get('host')}`;

    const pageTitle = `${article.title} | ${siteName} News`;
    const pageDescription = article.summary || (article.content ? article.content.replace(/<[^>]*>?/gm, '').slice(0, 160) : `Latest smartphone news and updates on ${siteName}.`);
    const canonicalUrl = `${siteUrl}/news/${article.slug}`;
    const fullImageUrl = article.image ? (article.image.startsWith('http') ? article.image : `${siteUrl}${article.image}`) : `${siteUrl}/images/placeholder.svg`;
    const logoUrl = branding.site_logo ? (branding.site_logo.startsWith('http') ? branding.site_logo : `${siteUrl}${branding.site_logo}`) : `${siteUrl}/images/logo.png`;

    // Schema.org NewsArticle
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title,
      "image": [fullImageUrl],
      "datePublished": article.created_at,
      "dateModified": article.updated_at || article.created_at,
      "author": [{
        "@type": "Person",
        "name": article.author || "Editorial Team"
      }],
      "publisher": {
        "@type": "Organization",
        "name": siteName,
        "logo": {
          "@type": "ImageObject",
          "url": logoUrl
        }
      },
      "description": pageDescription
    };

    const replacements = {
      '{{PAGE_TITLE}}': escapeHtml(pageTitle),
      '{{META_DESCRIPTION}}': escapeHtml(pageDescription),
      '{{CANONICAL_URL}}': canonicalUrl,
      '{{ARTICLE_TITLE}}': escapeHtml(article.title),
      '{{ARTICLE_SLUG}}': escapeHtml(article.slug),
      '{{ARTICLE_IMAGE}}': fullImageUrl,
      '{{SCHEMA_JSON}}': JSON.stringify(schemaData)
    };

    await renderViewWithSnippets(res, 'news-detail.html', replacements);
  } catch (err) {
    next(err);
  }
});

/**
 * Public Custom Pages (About Us, Contact Us, Privacy Policy, Disclaimer, etc.)
 */
async function renderCustomPage(req, res, next, pageSlug) {
  try {
    const page = await PageModel.getBySlug(pageSlug);
    if (!page || page.status !== 'published') {
      return await renderViewWithSnippets(res, '404.html', {}, 404);
    }

    // Increment page views asynchronously
    PageModel.incrementViews(page.id).catch(console.error);

    const branding = await SettingsModel.getBranding();
    const siteName = branding.site_name || 'PhonesDaddy';
    const siteUrl = branding.site_url || `${req.protocol}://${req.get('host')}`;

    let pageTitle = page.meta_title || `${page.title} | ${siteName}`;
    let pageDescription = page.meta_description || `${page.title} on ${siteName} - Authentic Mobile Specifications & Pricing.`;
    let pageHeading = page.title || '';
    let pageContent = page.content || '';
    if (branding.site_name && branding.site_name !== 'PhonesDaddy') {
      pageTitle = pageTitle.replace(/PhonesDaddy/gi, branding.site_name);
      pageDescription = pageDescription.replace(/PhonesDaddy/gi, branding.site_name);
      pageHeading = pageHeading.replace(/PhonesDaddy/gi, branding.site_name);
      pageContent = pageContent.replace(/PhonesDaddy/gi, branding.site_name);
    }
    const canonicalUrl = `${siteUrl}/page/${page.slug}`;
    const logoUrl = branding.site_logo ? (branding.site_logo.startsWith('http') ? branding.site_logo : `${siteUrl}${branding.site_logo}`) : `${siteUrl}/images/logo.png`;

    const schemaData = {
      "@context": "https://schema.org",
      "@type": page.slug === 'contact-us' ? "ContactPage" : page.slug === 'about-us' ? "AboutPage" : "WebPage",
      "name": page.title,
      "description": pageDescription,
      "url": canonicalUrl,
      "publisher": {
        "@type": "Organization",
        "name": siteName,
        "logo": {
          "@type": "ImageObject",
          "url": logoUrl
        }
      }
    };

    const dateStr = page.updated_at 
      ? new Date(page.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : (page.created_at ? new Date(page.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '');

    const replacements = {
      '{{PAGE_TITLE}}': escapeHtml(pageTitle),
      '{{META_DESCRIPTION}}': escapeHtml(pageDescription),
      '{{CANONICAL_URL}}': canonicalUrl,
      '{{PAGE_HEADING}}': escapeHtml(pageHeading),
      '{{PAGE_DATE}}': dateStr,
      '{{PAGE_CONTENT}}': pageContent,
      '{{SHOW_CONTACT_FORM}}': page.slug === 'contact-us' ? 'block' : 'none',
      '{{SCHEMA_JSON}}': JSON.stringify(schemaData)
    };

    await renderViewWithSnippets(res, 'page.html', replacements);
  } catch (err) {
    next(err);
  }
}

// Canonical Page Route: /page/:slug
router.get('/page/:slug', async (req, res, next) => {
  await renderCustomPage(req, res, next, req.params.slug);
});

// Direct Friendly Root Aliases for Core Pages
router.get('/about-us', async (req, res, next) => {
  await renderCustomPage(req, res, next, 'about-us');
});
router.get('/contact-us', async (req, res, next) => {
  await renderCustomPage(req, res, next, 'contact-us');
});
router.get('/privacy-policy', async (req, res, next) => {
  await renderCustomPage(req, res, next, 'privacy-policy');
});
router.get('/disclaimer', async (req, res, next) => {
  await renderCustomPage(req, res, next, 'disclaimer');
});

// Dynamic XML Sitemap
router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const branding = await SettingsModel.getBranding();
    const host = branding.site_url || `${req.protocol}://${req.get('host')}`;
    const today = new Date().toISOString().split('T')[0];

    const { phones } = await PhoneModel.getPhones({ page: 1, limit: 1000 });
    const brands = await BrandModel.getAllBrands(true);
    const { articles: newsList } = await NewsModel.getArticles({ page: 1, limit: 500, status: 'published' });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    const staticPages = [
      { loc: `${host}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${host}/phones`, changefreq: 'daily', priority: '0.9' },
      { loc: `${host}/news`, changefreq: 'daily', priority: '0.9' },
      { loc: `${host}/brands`, changefreq: 'weekly', priority: '0.8' },
      { loc: `${host}/compare`, changefreq: 'weekly', priority: '0.8' }
    ];

    for (const page of staticPages) {
      xml += `  <url>\n    <loc>${page.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
    }

    // Brands
    for (const b of brands) {
      xml += `  <url>\n    <loc>${host}/brand/${b.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    // Phones
    for (const p of phones) {
      xml += `  <url>\n    <loc>${host}/phone/${p.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // News & Blog Articles
    for (const a of newsList) {
      xml += `  <url>\n    <loc>${host}/news/${a.slug}</loc>\n    <lastmod>${a.updated_at ? new Date(a.updated_at).toISOString().split('T')[0] : today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // Custom Pages (About Us, Contact Us, Privacy Policy, Disclaimer, etc.)
    const { pages: customPages } = await PageModel.getPages({ page: 1, limit: 100, status: 'published' });
    for (const pg of customPages) {
      const pageLoc = ['about-us', 'contact-us', 'privacy-policy', 'disclaimer'].includes(pg.slug)
        ? `${host}/${pg.slug}`
        : `${host}/page/${pg.slug}`;
      xml += `  <url>\n    <loc>${pageLoc}</loc>\n    <lastmod>${pg.updated_at ? new Date(pg.updated_at).toISOString().split('T')[0] : today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

// Robots.txt
router.get('/robots.txt', async (req, res) => {
  const branding = await SettingsModel.getBranding();
  const host = branding.site_url || `${req.protocol}://${req.get('host')}`;
  const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/*\nDisallow: /api/*\n\nSitemap: ${host}/sitemap.xml\n`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// --- Admin Panel Views ---
router.get('/admin', (req, res) => {
  if (req.session && req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  return res.redirect('/admin/login');
});

router.get('/admin/login', (req, res) => {
  if (req.session && req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  res.sendFile(path.join(adminDir, 'login.html'));
});

router.get('/admin/dashboard', requireAdminAuth, (req, res) => {
  res.sendFile(path.join(adminDir, 'dashboard.html'));
});

router.get('/admin/phones', requireAdminAuth, (req, res) => {
  res.sendFile(path.join(adminDir, 'phones.html'));
});

router.get('/admin/phones/new', requireAdminAuth, (req, res) => {
  res.sendFile(path.join(adminDir, 'phone-form.html'));
});

router.get('/admin/phones/edit/:id', requireAdminAuth, (req, res) => {
  res.sendFile(path.join(adminDir, 'phone-form.html'));
});

router.get('/admin/brands', requireAdminAuth, (req, res) => {
  res.sendFile(path.join(adminDir, 'brands.html'));
});

router.get('/admin/news', requireAdminAuth, (req, res) => {
  res.sendFile(path.join(adminDir, 'news.html'));
});

router.get('/admin/news/new', requireAdminAuth, (req, res) => {
  res.sendFile(path.join(adminDir, 'news-form.html'));
});

router.get('/admin/news/edit/:id', requireAdminAuth, (req, res) => {
  res.sendFile(path.join(adminDir, 'news-form.html'));
});

router.get('/admin/categories', requireAdminAuth, (req, res) => {
  res.sendFile(path.join(adminDir, 'categories.html'));
});

router.get('/admin/pages', requireAdminAuth, (req, res) => {
  res.sendFile(path.join(adminDir, 'pages.html'));
});

router.get('/admin/pages/new', requireAdminAuth, (req, res) => {
  res.sendFile(path.join(adminDir, 'page-form.html'));
});

router.get('/admin/pages/edit/:id', requireAdminAuth, (req, res) => {
  res.sendFile(path.join(adminDir, 'page-form.html'));
});

router.get('/admin/settings', requireAdminAuth, (req, res) => {
  res.sendFile(path.join(adminDir, 'settings.html'));
});

router.get('/admin/profile', requireAdminAuth, (req, res) => {
  res.sendFile(path.join(adminDir, 'profile.html'));
});

router.get('/admin/reviews', requireAdminAuth, (req, res) => {
  res.sendFile(path.join(adminDir, 'reviews.html'));
});

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

module.exports = router;


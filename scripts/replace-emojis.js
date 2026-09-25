/**
 * Batch Emoji-to-SVG Replacement Script
 * Replaces all emoji icons with inline SVG icons across all view and JS files.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ─── SVG Icon Strings ───────────────────────────────────────────────────────

const SVG = {
  search: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  lock: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  menu: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
  closeX: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  phone: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>',
  fire: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  star: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  eye: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  comment: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
  calendar: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
  shield: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
  tag: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>',
  wallet: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>',
  newspaper: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>',
  globe: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
  compare: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>',
  camera: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
  rocket: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 3 0 3 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-3 0-3"/></svg>',
  penLine: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  clipboard: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>',
  link: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  checkCircle: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
  mail: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  clock: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  flag: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>',
  info: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  verified: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>',
};

// ─── Replacement Map for HTML templates ─────────────────────────────────────
// Each entry: [search_string, replacement_string]

const htmlReplacements = [
  // Header: Search icon
  [`<span class="search-icon">🔍</span>`, `<span class="search-icon">${SVG.search}</span>`],
  [`<span class="hero-search-icon">🔍</span>`, `<span class="hero-search-icon">${SVG.search}</span>`],

  // Header: Login link
  [`🔐 Login`, `${SVG.lock} Login`],

  // Header: Hamburger
  [`aria-label="Toggle Menu">☰</button>`, `aria-label="Toggle Menu">${SVG.menu}</button>`],

  // Phone detail: sidebar widget titles
  [`<span>📱 Phone Finder</span>`, `<span>${SVG.phone} Phone Finder</span>`],
  [`<span class="widget-icon">🔍</span>`, `<span class="widget-icon">${SVG.search}</span>`],
  [`<span>💰 Prices</span>`, `<span>${SVG.wallet} Prices</span>`],
  [`<span class="widget-icon">🏷️</span>`, `<span class="widget-icon">${SVG.tag}</span>`],
  [`<span class="widget-icon">📰</span>`, `<span class="widget-icon">${SVG.newspaper}</span>`],
  [`<span class="widget-icon">⭐</span>`, `<span class="widget-icon">${SVG.star}</span>`],
  [`<span class="widget-icon">🔥</span>`, `<span class="widget-icon">${SVG.fire}</span>`],

  // Phone detail: price region labels
  [`<span class="gsm-price-store">🇵🇰 Official PKR</span>`, `<span class="gsm-price-store">${SVG.flag} Official PKR</span>`],
  [`<span class="gsm-price-store">🌐 Global USD</span>`, `<span class="gsm-price-store">${SVG.globe} Global USD</span>`],
  [`<span class="gsm-price-store">🇪🇺 European EUR</span>`, `<span class="gsm-price-store">${SVG.globe} European EUR</span>`],

  // Phone detail: meta chips
  [`<span class="chip-icon">📅</span>`, `<span class="chip-icon">${SVG.calendar}</span>`],
  [`<span class="chip-icon">🛡️</span>`, `<span class="chip-icon">${SVG.shield}</span>`],
  [`<span class="chip-icon">👁️</span>`, `<span class="chip-icon">${SVG.eye}</span>`],
  [`<span class="chip-icon">💬</span>`, `<span class="chip-icon">${SVG.comment}</span>`],

  // Phone detail: price box
  [`<span class="price-flag">🇵🇰</span>`, `<span class="price-flag">${SVG.flag}</span>`],

  // Phone detail: action button
  [`⚖️ Add to Compare`, `${SVG.compare} Add to Compare`],

  // Phone detail: quick tabs
  [`<span class="tab-icon">⭐</span>`, `<span class="tab-icon">${SVG.star}</span>`],
  [`<span class="tab-icon">💬</span>`, `<span class="tab-icon">${SVG.comment}</span>`],
  [`<span class="tab-icon">⚖️</span>`, `<span class="tab-icon">${SVG.compare}</span>`],
  [`<span class="tab-icon">📷</span>`, `<span class="tab-icon">${SVG.camera}</span>`],
  [`<span class="tab-icon">💰</span>`, `<span class="tab-icon">${SVG.wallet}</span>`],

  // Phone detail: reviews section
  [`<span>⭐ User Reviews &amp; Ratings</span>`, `<span>${SVG.star} User Reviews &amp; Ratings</span>`],
  [`<span>⭐ User Reviews & Ratings</span>`, `<span>${SVG.star} User Reviews & Ratings</span>`],
  [`✍️ Write a Review`, `${SVG.penLine} Write a Review`],
  [`🚀 Submit Review`, `${SVG.rocket} Submit Review`],
  [`📷 Photos &amp; 🔗 Links Supported`, `${SVG.camera} Photos &amp; ${SVG.link} Links Supported`],
  [`📷 Photos & 🔗 Links Supported`, `${SVG.camera} Photos & ${SVG.link} Links Supported`],

  // Star rating label (leave alone - it's decorative text updated by JS)

  // News page: category pill
  [`🔥 Hot News`, `${SVG.fire} Hot News`],

  // News page: search icon inline
  [`font-size: 13px;">🔍</span>`, `font-size: 13px;">${SVG.search}</span>`],

  // News page: empty state icon
  [`<div style="font-size: 32px; margin-bottom: 10px;">📰</div>`, `<div style="font-size: 32px; margin-bottom: 10px;">${SVG.newspaper}</div>`],

  // News detail: hot badge
  [`🔥 HOT`, `${SVG.fire} HOT`],

  // News detail: article views and comments
  [`<span id="articleViews">👁️ 0 views</span>`, `<span id="articleViews">${SVG.eye} 0 views</span>`],
  [`💬 <span id="articleCommentsCount">`, `${SVG.comment} <span id="articleCommentsCount">`],
  [`⏱️ <span id="readingTime">`, `${SVG.clock} <span id="readingTime">`],

  // News detail: share buttons
  [`💬 WhatsApp`, `${SVG.comment} WhatsApp`],
  [`📋 Copy Link`, `${SVG.clipboard} Copy Link`],

  // News detail: comments section
  [`💬 Discussion &amp; Comments`, `${SVG.comment} Discussion &amp; Comments`],
  [`💬 Discussion & Comments`, `${SVG.comment} Discussion & Comments`],
  [`✍️ Leave Comment`, `${SVG.penLine} Leave Comment`],
  [`💬 Post Comment`, `${SVG.comment} Post Comment`],

  // News detail: related stories
  [`🔥 More Trending Stories`, `${SVG.fire} More Trending Stories`],

  // Page template: meta
  [`<span>📅 Last Updated:`, `<span>${SVG.calendar} Last Updated:`],
  [`<span>🌐 {{SITE_NAME}} Official</span>`, `<span>${SVG.globe} {{SITE_NAME}} Official</span>`],
  [`✉️ Send Message`, `${SVG.mail} Send Message`],
  [`✅ Thank you! Your message has been received.`, `${SVG.checkCircle} Thank you! Your message has been received.`],
];

// ─── File processing ────────────────────────────────────────────────────────

function processHTMLFiles() {
  const viewsDir = path.join(ROOT, 'views');
  const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.html'));

  let totalChanges = 0;

  files.forEach(filename => {
    const filePath = path.join(viewsDir, filename);
    let content = fs.readFileSync(filePath, 'utf8');
    let changeCount = 0;

    htmlReplacements.forEach(([search, replace]) => {
      const count = content.split(search).length - 1;
      if (count > 0) {
        content = content.split(search).join(replace);
        changeCount += count;
      }
    });

    // Add icons.js script before app.js in files that don't have it yet
    if (!content.includes('/js/icons.js')) {
      // Before the first <script src="/js/ line
      content = content.replace(
        /<script src="\/js\/app\.js"><\/script>/,
        '<script src="/js/icons.js"></script>\n  <script src="/js/app.js"></script>'
      );
    }

    if (changeCount > 0 || content !== fs.readFileSync(filePath, 'utf8')) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ ${filename}: ${changeCount} emoji replacements`);
      totalChanges += changeCount;
    } else {
      console.log(`  ${filename}: no changes needed`);
    }
  });

  console.log(`\nTotal HTML replacements: ${totalChanges}`);
}

function processJSFiles() {
  console.log('\n--- Processing JS Files ---\n');

  // app.js: Replace emoji references
  processFile(path.join(ROOT, 'public/js/app.js'), [
    [`toggleBtn.textContent = isOpen ? '✕' : '☰';`, `toggleBtn.innerHTML = isOpen ? ICONS.close : ICONS.menu;`],
    [`toggleBtn.textContent = '☰';`, `toggleBtn.innerHTML = ICONS.menu;`],
    [`<span class="search-icon">🔍</span>`, `<span class="search-icon">' + ICONS.search + '</span>`],
  ]);

  // phones.js: Replace emojis in card rendering
  processFile(path.join(ROOT, 'public/js/phones.js'), [
    [`<span>👁️ \${`, `<span>' + ICONS.eye + ' \${`],
    [`💬 \${phone.review_count`, `' + ICONS.comment + ' \${phone.review_count`],
  ]);

  // phone-detail.js: Replace emojis
  processFile(path.join(ROOT, 'public/js/phone-detail.js'), [
    [`<span>📅 \${dateStr}</span>`, `<span>' + ICONS.calendar + ' \${dateStr}</span>`],
    [`'✅ ' + (json.message`, `ICONS.checkCircle + ' ' + (json.message`],
    [`submitBtn.textContent = '🚀 Submit Review';`, `submitBtn.innerHTML = ICONS.rocket + ' Submit Review';`],
    [`💬 Reply`, `' + ICONS.reply + ' Reply`],
    [`🌐 Website`, `' + ICONS.globe + ' Website`],
    [`'✅ Reply posted successfully!'`, `ICONS.checkCircle + ' Reply posted successfully!'`],
  ]);

  // Handle star labels in phone-detail.js
  const phoneDetailPath = path.join(ROOT, 'public/js/phone-detail.js');
  let pd = fs.readFileSync(phoneDetailPath, 'utf8');
  pd = pd.replace(
    /const starLabels = \{[\s\S]*?1: '⭐ Terrible \(1\/5\)',[\s\S]*?2: '⭐⭐ Poor \(2\/5\)',[\s\S]*?3: '⭐⭐⭐ Average \(3\/5\)',[\s\S]*?4: '⭐⭐⭐⭐ Good \(4\/5\)',[\s\S]*?5: '⭐⭐⭐⭐⭐ Excellent \(5\/5\)'\s*\};/,
    `const starLabels = {\n  1: '★ Terrible (1/5)',\n  2: '★★ Poor (2/5)',\n  3: '★★★ Average (3/5)',\n  4: '★★★★ Good (4/5)',\n  5: '★★★★★ Excellent (5/5)'\n};`
  );
  fs.writeFileSync(phoneDetailPath, pd, 'utf8');
  console.log('✓ phone-detail.js: star labels updated');
}

function processFile(filePath, replacements) {
  const filename = path.basename(filePath);
  if (!fs.existsSync(filePath)) {
    console.log(`  ${filename}: FILE NOT FOUND`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;

  replacements.forEach(([search, replace]) => {
    const count = content.split(search).length - 1;
    if (count > 0) {
      content = content.split(search).join(replace);
      changeCount += count;
    }
  });

  if (changeCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ ${filename}: ${changeCount} replacements`);
  } else {
    console.log(`  ${filename}: no replacements matched`);
  }
}

// ─── Run ────────────────────────────────────────────────────────────────────

console.log('=== Emoji → SVG Icon Replacement ===\n');
console.log('--- Processing HTML View Files ---\n');
processHTMLFiles();
processJSFiles();
console.log('\n=== Complete! ===');

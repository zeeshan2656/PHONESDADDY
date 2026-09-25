/**
 * Admin Emoji-to-SVG Replacement Script
 * Replaces emoji icons across all admin HTML files and admin.js with inline SVG icons.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const SVG = {
  dashboard: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
  phone: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>',
  tag: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>',
  newspaper: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>',
  folder: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
  fileText: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
  comment: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
  settings: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  globe: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
  megaphone: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>',
  user: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  menu: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
  closeX: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  star: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  lock: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  checkCircle: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
  eye: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  calendar: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>'
};

const adminReplacements = [
  // Navigation
  ['>📊 Dashboard<', `>${SVG.dashboard} Dashboard<`],
  ['>📱 Phones<', `>${SVG.phone} Phones<`],
  ['>🏷️ Brands<', `>${SVG.tag} Brands<`],
  ['>🏷 Brands<', `>${SVG.tag} Brands<`],
  ['>📰 Blog &amp; News<', `>${SVG.newspaper} Blog &amp; News<`],
  ['>📰 Blog & News<', `>${SVG.newspaper} Blog & News<`],
  ['>📑 Article Categories<', `>${SVG.folder} Article Categories<`],
  ['>📄 Pages<', `>${SVG.fileText} Pages<`],
  ['>💬 Reviews &amp; Comments<', `>${SVG.comment} Reviews &amp; Comments<`],
  ['>💬 Reviews & Comments<', `>${SVG.comment} Reviews & Comments<`],
  ['<span>⚙️ Settings</span>', `<span>${SVG.settings} Settings</span>`],
  ['<span>🌐 General &amp; Snippets</span>', `<span>${SVG.globe} General &amp; Snippets</span>`],
  ['<span>🌐 General & Snippets</span>', `<span>${SVG.globe} General & Snippets</span>`],
  ['<span>📢 Ad Placements</span>', `<span>${SVG.megaphone} Ad Placements</span>`],
  ['<span>👤 Admin Profile</span>', `<span>${SVG.user} Admin Profile</span>`],
  ['>🌐 Public Site<', `>${SVG.globe} Public Site<`],

  // Header and controls
  ['aria-label="Close Navigation">✕</button>', `aria-label="Close Navigation">${SVG.closeX}</button>`],
  ['aria-label="Toggle Navigation Menu">☰</button>', `aria-label="Toggle Navigation Menu">${SVG.menu}</button>`],
  ['aria-label="Toggle Menu">☰</button>', `aria-label="Toggle Menu">${SVG.menu}</button>`],

  // Card headers & titles
  ['📱 Recently Added Smartphones', `${SVG.phone} Recently Added Smartphones`],
  ['📱 Active Device Catalog', `${SVG.phone} Active Device Catalog`],
  ['📱 Device Specifications Editor', `${SVG.phone} Device Specifications Editor`],
  ['🏷️ Brand Management', `${SVG.tag} Brand Management`],
  ['🏷️ Website Identity &amp; Domain', `${SVG.tag} Website Identity &amp; Domain`],
  ['🏷️ Website Identity & Domain', `${SVG.tag} Website Identity & Domain`],
  ['🌐 Browser Favicon &amp; Tab Icon', `${SVG.globe} Browser Favicon &amp; Tab Icon`],
  ['🌐 Browser Favicon & Tab Icon', `${SVG.globe} Browser Favicon & Tab Icon`],
  ['📢 Google AdSense &amp; Banner Placements Manager', `${SVG.megaphone} Google AdSense &amp; Banner Placements Manager`],
  ['📢 Google AdSense & Banner Placements Manager', `${SVG.megaphone} Google AdSense & Banner Placements Manager`],
  ['👤 Master Admin Profile &amp; Credentials', `${SVG.user} Master Admin Profile &amp; Credentials`],
  ['👤 Master Admin Profile & Credentials', `${SVG.user} Master Admin Profile & Credentials`],
  ['🔒 Change Password', `${SVG.lock} Change Password`],
  ['💬 Reviews &amp; Comments &rarr;', `${SVG.comment} Reviews &amp; Comments &rarr;`],
  ['💬 Reviews & Comments &rarr;', `${SVG.comment} Reviews & Comments &rarr;`],
  ['📄 Pages &rarr;', `${SVG.fileText} Pages &rarr;`],
  ['📢 Ad Placements &rarr;', `${SVG.megaphone} Ad Placements &rarr;`],
  ['📱 Mobile Reviews', `${SVG.phone} Mobile Reviews`],
  ['📰 Blog Comments', `${SVG.newspaper} Blog Comments`],
  ['💬 User Reviews &amp; Comments Management', `${SVG.comment} User Reviews &amp; Comments Management`],
  ['💬 User Reviews & Comments Management', `${SVG.comment} User Reviews & Comments Management`],
  ['📑 Category Management', `${SVG.folder} Category Management`],
  ['📄 Page Management', `${SVG.fileText} Page Management`],
  ['📰 Blog &amp; News Updates', `${SVG.newspaper} Blog &amp; News Updates`],
  ['📰 Blog & News Updates', `${SVG.newspaper} Blog & News Updates`],
  ['📰 Edit Blog Article', `${SVG.newspaper} Edit Blog Article`],
  ['📰 Create Blog Article', `${SVG.newspaper} Create Blog Article`],
  ['📰 Article Content &amp; Media', `${SVG.newspaper} Article Content &amp; Media`],
  ['📰 Article Content & Media', `${SVG.newspaper} Article Content & Media`],
  ['📑 Article Hierarchy &amp; Categorization', `${SVG.folder} Article Hierarchy &amp; Categorization`],
  ['📑 Article Hierarchy & Categorization', `${SVG.folder} Article Hierarchy & Categorization`],
  ['📄 Page Content &amp; Design', `${SVG.fileText} Page Content &amp; Design`],
  ['📄 Page Content & Design', `${SVG.fileText} Page Content & Design`],

  ['<span>🔍 Advanced Phone Search &amp; Filters</span>', `<span>${SVG.search} Advanced Phone Search &amp; Filters</span>`],
  ['<span>🔍 Advanced Phone Search & Filters</span>', `<span>${SVG.search} Advanced Phone Search & Filters</span>`],
  ['💬 Feedback Thread &amp; Admin Reply', `${SVG.comment} Feedback Thread &amp; Admin Reply`],
  ['💬 Feedback Thread & Admin Reply', `${SVG.comment} Feedback Thread & Admin Reply`],
  ['🔗 Link</button>', `${SVG.link} Link</button>`],
  ['📷 Add Photo</button>', `${SVG.camera} Add Photo</button>`],
  ['class="badge-review">📱 Mobile</span>', `class="badge-review">${SVG.phone} Mobile</span>`],
  ['class="badge-comment">📰 Blog</span>', `class="badge-comment">${SVG.newspaper} Blog</span>`],
  ['✅ Approve</button>', `${SVG.checkCircle} Approve</button>`],
  ['class="user-web-link">🌐 ', `class="user-web-link">${SVG.globe} `],
  ['class="user-contact">✉️ ', `class="user-contact">${SVG.mail} `],
  ['<span>👁️ Current Active Password</span>', `<span>${SVG.lock} Current Active Password</span>`],
  ['📋 Copy Password', `${SVG.clipboard} Copy Password`],
  ['<span id="pwEyeIcon">👁️</span>', `<span id="pwEyeIcon">${SVG.eye}</span>`],
  ['font-size: 14px;">👁️</button>', `font-size: 14px;">${SVG.eye}</button>`],
  ['👁️ Preview Output', `${SVG.eye} Preview Output`],
  ['👁️ View Public Site', `${SVG.globe} View Public Site`],
  ['👁️ Live Real-Time Brand Mockup', `${SVG.eye} Live Real-Time Brand Mockup`],
  ['<span>💰 Google AdSense Auto Ads</span>', `<span>${SVG.wallet} Google AdSense Auto Ads</span>`],
  ['<span>🔍 Google Search Console</span>', `<span>${SVG.search} Google Search Console</span>`],
  ['📋 Copy Code', `${SVG.clipboard} Copy Code`],
  ['<span id="tabSimFavicon" style="font-size: 14px; display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px;">📱</span>', `<span id="tabSimFavicon" style="font-size: 14px; display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px;">${SVG.phone}</span>`],
  ['closePreviewModal()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b;">✕</button>', `closePreviewModal()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b;">${SVG.closeX}</button>`],
  ['👁️ About Us', `${SVG.eye} About Us`],
  ['👁️ Contact Us', `${SVG.eye} Contact Us`],
  ['👁️ Privacy', `${SVG.eye} Privacy`],
  ['👁️ Disclaimer', `${SVG.eye} Disclaimer`],
  ['✅ Yes</span>', `${SVG.checkCircle} Yes</span>`],
  ['title="View Live Page" style="padding: 4px 8px; font-size: 12px;">👁️</a>', `title="View Live Page" style="padding: 4px 8px; font-size: 12px;">${SVG.eye}</a>`],
  ['👁️ View Live Page', `${SVG.eye} View Live Page`],
  ['<h2>📰 News &amp; Blog</h2>', `<h2>${SVG.newspaper} News &amp; Blog</h2>`],
  ['<h2>📰 News & Blog</h2>', `<h2>${SVG.newspaper} News & Blog</h2>`],
  ["const icon = type === 'error' ? '⚠️' : type === 'info' ? 'ℹ️' : '✅';", "const icon = type === 'error' ? (window.ICONS ? ICONS.info : '!') : type === 'info' ? (window.ICONS ? ICONS.info : 'i') : (window.ICONS ? ICONS.checkCircle : '✓');"],

  // Select dropdown options - replace emojis with text/clean symbols
  ['⭐⭐⭐⭐⭐ 5 Stars', '★★★★★ 5 Stars'],
  ['⭐⭐⭐⭐ 4 Stars', '★★★★ 4 Stars'],
  ['⭐⭐⭐ 3 Stars', '★★★ 3 Stars'],
  ['⭐⭐ 2 Stars', '★★ 2 Stars'],
  ['⭐ 1 Star', '★ 1 Star'],
  ['⭐ Adsterra', '★ Adsterra'],
  ['⭐ Monetag', '★ Monetag']
];

function processAdminHTML() {
  const adminDir = path.join(ROOT, 'admin');
  const files = fs.readdirSync(adminDir).filter(f => f.endsWith('.html'));

  let totalReplacements = 0;

  files.forEach(filename => {
    const filePath = path.join(adminDir, filename);
    let content = fs.readFileSync(filePath, 'utf8');
    let changeCount = 0;

    adminReplacements.forEach(([search, replace]) => {
      const count = content.split(search).length - 1;
      if (count > 0) {
        content = content.split(search).join(replace);
        changeCount += count;
      }
    });

    // Ensure icons.js is loaded before admin.js
    if (!content.includes('/js/icons.js') && content.includes('/js/admin.js')) {
      content = content.replace(
        '<script src="/js/admin.js"></script>',
        '<script src="/js/icons.js"></script>\n  <script src="/js/admin.js"></script>'
      );
      changeCount++;
    }

    if (changeCount > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ admin/${filename}: ${changeCount} updates`);
      totalReplacements += changeCount;
    } else {
      console.log(`  admin/${filename}: clean`);
    }
  });

  console.log(`Total admin HTML replacements: ${totalReplacements}`);
}

function processAdminJS() {
  const adminJsPath = path.join(ROOT, 'public/js/admin.js');
  let js = fs.readFileSync(adminJsPath, 'utf8');
  let count = 0;

  // 1. Toast icons
  if (js.includes("const icon = type === 'error' ? '⚠️' : type === 'info' ? 'ℹ️' : '✅';")) {
    js = js.replace(
      "const icon = type === 'error' ? '⚠️' : type === 'info' ? 'ℹ️' : '✅';",
      "const icon = type === 'error' ? (window.ICONS ? ICONS.info : '!') : type === 'info' ? (window.ICONS ? ICONS.info : 'i') : (window.ICONS ? ICONS.checkCircle : '✓');"
    );
    count++;
  }

  // 2. Reviews badge in phones list
  if (js.includes('💬 ${p.review_count || 0}')) {
    js = js.replace('💬 ${p.review_count || 0}', '${window.ICONS ? ICONS.comment : "💬"} ${p.review_count || 0}');
    count++;
  }

  // 3. Primary photo badge
  if (js.includes('⭐ Primary')) {
    js = js.replace('⭐ Primary', '★ Primary');
    count++;
  }

  // 4. Mobile / Blog badges in reviews table
  if (js.includes('>📱 Mobile<')) {
    js = js.replace('>📱 Mobile<', '>${window.ICONS ? ICONS.phone : ""} Mobile<');
    count++;
  }
  if (js.includes('>📰 Blog<')) {
    js = js.replace('>📰 Blog<', '>${window.ICONS ? ICONS.newspaper : ""} Blog<');
    count++;
  }

  // 5. Review view & reply button
  if (js.includes('💬 View &amp; Reply')) {
    js = js.replace('💬 View &amp; Reply', '${window.ICONS ? ICONS.comment : ""} View &amp; Reply');
    count++;
  }

  // 6. Review conversation thread header
  if (js.includes('💬 Conversation Thread')) {
    js = js.replace('💬 Conversation Thread', '${window.ICONS ? ICONS.comment : ""} Conversation Thread');
    count++;
  }

  // 7. Date icon in review thread
  if (js.includes('📅 ${dateStr}')) {
    js = js.replace('📅 ${dateStr}', '${window.ICONS ? ICONS.calendar : ""} ${dateStr}');
    count++;
  }

  // 8. Dynamic sidebar buttons
  if (js.includes("closeBtn.innerHTML = '✕';")) {
    js = js.replace("closeBtn.innerHTML = '✕';", "closeBtn.innerHTML = window.ICONS ? ICONS.close : '✕';");
    count++;
  }
  if (js.includes("btn.innerHTML = '☰';")) {
    js = js.replace("btn.innerHTML = '☰';", "btn.innerHTML = window.ICONS ? ICONS.menu : '☰';");
    count++;
  }

  // 9. Alert messages in admin.js - clean prefixes
  const alertReplacements = [
    ["'✅ Settings and Branding saved", "'Settings and Branding saved"],
    ["'✅ Website logo uploaded", "'Website logo uploaded"],
    ["'✅ Custom logo removed", "'Custom logo removed"],
    ["'✅ Browser favicon uploaded", "'Browser favicon uploaded"],
    ["'✅ Favicon removed", "'Favicon removed"],
    ["'📋 Current password copied", "'Current password copied"],
    ["'📋 Password copied", "'Password copied"],
    ["'✅ ' + json.message", "json.message"],
    ["'✅ ' + (json.message", "(json.message"],
    ["'<span>✅</span> <span>Summary Generated!</span>'", "'<span>Summary Generated!</span>'"],
    ["✅ Specs Successfully Fetched", "Specs Successfully Fetched"]
  ];

  alertReplacements.forEach(([s, r]) => {
    if (js.includes(s)) {
      js = js.split(s).join(r);
      count++;
    }
  });

  fs.writeFileSync(adminJsPath, js, 'utf8');
  console.log(`✓ public/js/admin.js: ${count} updates`);
}

console.log('=== Processing Admin Files ===\n');
processAdminHTML();
processAdminJS();
console.log('\n=== Admin Files Complete! ===');

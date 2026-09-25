/**
 * Final Emoji Cleanup Script
 * Replaces all remaining emojis in admin templates and admin.js with SVGs or clean text.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const SVG = {
  phone: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>',
  newspaper: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>',
  globe: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
  folder: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
  fire: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  comment: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
  penLine: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  eye: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  trash: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
  camera: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
  closeX: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  shield: '<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
};

// 1. admin/news.html
const newsHtmlPath = path.join(ROOT, 'admin/news.html');
let newsHtml = fs.readFileSync(newsHtmlPath, 'utf8');
newsHtml = newsHtml
  .replace('>🌐 Site<', `>${SVG.globe} Site<`)
  .replace('>📑 Categories<', `>${SVG.folder} Categories<`)
  .replace('>🔥 Hot Stories<', `>${SVG.fire} Hot Stories<`)
  .replace('>🔥 Hot News</option>', '>Hot News</option>')
  .replace('<div style="font-size: 28px; margin-bottom: 8px;">📰</div>', `<div style="font-size: 28px; margin-bottom: 8px; color: #0d9488;">${SVG.newspaper}</div>`)
  .replace('🔥 HOT</span>', `${SVG.fire} HOT</span>`)
  .replace('💬 ${a.comment_count || 0}', `${SVG.comment} \${a.comment_count || 0}`)
  .replace('✏️ Edit</a>', `${SVG.penLine} Edit</a>`)
  .replace('title="View Public Article" style="padding: 4px 8px; font-size: 12px;">👁️</a>', `title="View Public Article" style="padding: 4px 8px; font-size: 12px;">${SVG.eye}</a>`)
  .replace('title="Delete" style="padding: 4px 8px; font-size: 12px; background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;">🗑️</button>', `title="Delete" style="padding: 4px 8px; font-size: 12px; background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;">${SVG.trash}</button>`);
fs.writeFileSync(newsHtmlPath, newsHtml, 'utf8');
console.log('✓ admin/news.html cleaned');

// 2. admin/news-form.html
const newsFormPath = path.join(ROOT, 'admin/news-form.html');
let newsForm = fs.readFileSync(newsFormPath, 'utf8');
newsForm = newsForm
  .replace('<option value="draft">🟡 Draft (Hidden)</option>', '<option value="draft">Draft (Hidden)</option>')
  .replace('<span>🔥 Feature as Hot News</span>', `<span>${SVG.fire} Feature as Hot News</span>`)
  .replace('<div style="font-size: 28px; margin-bottom: 4px;">📷</div>', `<div style="font-size: 28px; margin-bottom: 4px; color: #0d9488;">${SVG.camera}</div>`);
fs.writeFileSync(newsFormPath, newsForm, 'utf8');
console.log('✓ admin/news-form.html cleaned');

// 3. admin/reviews.html
const reviewsHtmlPath = path.join(ROOT, 'admin/reviews.html');
let reviewsHtml = fs.readFileSync(reviewsHtmlPath, 'utf8');
reviewsHtml = reviewsHtml
  .replace("💬 ${item.reply_count > 0 ? `Thread (${item.reply_count})` : 'Reply'}", `\${window.ICONS ? ICONS.comment : ''} \${item.reply_count > 0 ? \`Thread (\${item.reply_count})\` : 'Reply'}`)
  .replace('title="Delete permanently">🗑️</button>', `title="Delete permanently">${SVG.trash}</button>`);
fs.writeFileSync(reviewsHtmlPath, reviewsHtml, 'utf8');
console.log('✓ admin/reviews.html cleaned');

// 4. admin/settings.html
const settingsHtmlPath = path.join(ROOT, 'admin/settings.html');
let settingsHtml = fs.readFileSync(settingsHtmlPath, 'utf8');
settingsHtml = settingsHtml
  .replace('<span style="color: #64748b; font-size: 10px; margin-left: 4px;">✕</span>', `<span style="color: #64748b; font-size: 10px; margin-left: 4px;">${SVG.closeX}</span>`)
  .replace('<span style="font-size: 18px;">📱</span>', `<span style="display:inline-flex;color:#0d9488;">${SVG.phone}</span>`)
  .replace('<span style="font-size: 18px;">📰</span>', `<span style="display:inline-flex;color:#0d9488;">${SVG.newspaper}</span>`)
  .split('📐 Recommended:').join('Recommended:');
fs.writeFileSync(settingsHtmlPath, settingsHtml, 'utf8');
console.log('✓ admin/settings.html cleaned');

// 5. public/js/admin.js
const adminJsPath = path.join(ROOT, 'public/js/admin.js');
let adminJs = fs.readFileSync(adminJsPath, 'utf8');
adminJs = adminJs
  .replace("tabFavicon.innerHTML = '📱';", "tabFavicon.innerHTML = window.ICONS ? ICONS.phone : '';")
  .replace("if (eyeIcon) eyeIcon.innerText = '🙈';", "if (eyeIcon) eyeIcon.innerHTML = window.ICONS ? ICONS.eye : '';")
  .replace("if (eyeIcon) eyeIcon.innerText = '👁️';", "if (eyeIcon) eyeIcon.innerHTML = window.ICONS ? ICONS.eye : '';")
  .replace("if (btn) btn.innerText = '🙈';", "if (btn) btn.innerHTML = window.ICONS ? ICONS.eye : '';")
  .replace("if (btn) btn.innerText = '👁️';", "if (btn) btn.innerHTML = window.ICONS ? ICONS.eye : '';")
  .replace('<div style="width:48px;height:48px;background:#0d9488;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;flex-shrink:0;">📱</div>', `<div style="width:48px;height:48px;background:#0d9488;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">${SVG.phone}</div>`)
  .replace('<div style="width:58px;height:58px;background:rgba(245,158,11,0.2);border:1px solid #f59e0b;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:30px;margin:0 auto 12px;">🛡️</div>', `<div style="width:58px;height:58px;background:rgba(245,158,11,0.2);border:1px solid #f59e0b;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#f59e0b;margin:0 auto 12px;">${SVG.shield}</div>`)
  .replace('<div style="width:48px;height:48px;background:#16a34a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;flex-shrink:0;">🛡️</div>', `<div style="width:48px;height:48px;background:#16a34a;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">${SVG.shield}</div>`);
fs.writeFileSync(adminJsPath, adminJs, 'utf8');
console.log('✓ public/js/admin.js cleaned');

console.log('\n=== Final Emoji Cleanup Complete ===');

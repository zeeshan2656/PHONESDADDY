const fs = require('fs');

const gsmHtml = fs.readFileSync('C:/Users/Basharat/.gemini/antigravity-ide/brain/d3c0c4c1-a5da-48f0-80b2-dc25342b53a5/scratch/gsm_sample.html', 'utf8');
const wmHtml = fs.readFileSync('C:/Users/Basharat/.gemini/antigravity-ide/brain/d3c0c4c1-a5da-48f0-80b2-dc25342b53a5/scratch/wm_sample.html', 'utf8');

console.log('=== GSMARENA IMAGES ===');
// Check specs-photo-main, pictures link, or all img tags
const gsmImgRegex = /<img[^>]+src=["']?([^"'\s>]+)/gi;
let m;
const gsmImages = new Set();
while ((m = gsmImgRegex.exec(gsmHtml)) !== null) {
  if (m[1].includes('bigpic') || m[1].includes('/vv/') || m[1].includes('pictures') || m[1].includes('-3d-') || m[1].includes('gsmarena_')) {
    gsmImages.add(m[1]);
  }
}
console.log('GSM phone-related images:', [...gsmImages]);

// Check if GSMArena has a "Pictures" page link e.g. zte_nubia_navix_ultra_5g-pictures-14946.php
const picturesLink = gsmHtml.match(/href=["']?([^"'>]*pictures-[^"'>]+)/i);
console.log('GSM Pictures page link:', picturesLink ? picturesLink[1] : 'None');

console.log('\n=== WHATMOBILE IMAGES ===');
const wmImgRegex = /<img[^>]+src=["']?([^"'\s>]+)/gi;
const wmImages = new Set();
while ((m = wmImgRegex.exec(wmHtml)) !== null) {
  if (m[1].includes('admin/images/')) {
    wmImages.add(m[1]);
  }
}
console.log('WhatMobile phone-related images:', [...wmImages]);

// Check if WhatMobile has multiple images or color variants or gallery links
const wmGalleryLinks = wmHtml.match(/admin\/images\/[^\s"'>]+/gi);
console.log('All admin/images matches in WM:', [...new Set(wmGalleryLinks || [])]);

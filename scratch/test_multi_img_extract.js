const fs = require('fs');

async function testExtractMultipleImages() {
  const gsmHtml = fs.readFileSync('C:/Users/Basharat/.gemini/antigravity-ide/brain/d3c0c4c1-a5da-48f0-80b2-dc25342b53a5/scratch/gsm_sample.html', 'utf8');

  const matches = [...gsmHtml.matchAll(/href=["']?([^"'\s>]+pictures[^"'\s>]+)/gi)];
  console.log('Matches with "pictures":', matches.map(m => m[1]));
  
  // Also check standard GSMArena URL pattern for pictures:
  // If phone URL is https://www.gsmarena.com/zte_nubia_navix_ultra_5g-14946.php
  // pictures URL is https://www.gsmarena.com/zte_nubia_navix_ultra_5g-pictures-14946.php
  const testUrl = 'https://www.gsmarena.com/zte_nubia_navix_ultra_5g-14946.php';
  const picUrl = testUrl.replace(/(-)(\d+\.php)$/i, '-pictures-$2');
  console.log('Constructed pictures URL:', picUrl);


  const gsmImages = new Set();
  // Main image
  const mainImgMatch = gsmHtml.match(/<div class="specs-photo-main">[\s\S]*?<img[^>]+src=["']?([^"'\s>]+)/i)
    || gsmHtml.match(/<img[^>]+src=["']?([^"'\s>]+\/vv\/bigpic\/[^"'\s>]+)/i);
  if (mainImgMatch) {
    let u = mainImgMatch[1];
    if (u.startsWith('//')) u = 'https:' + u;
    gsmImages.add(u);
  }

  if (picsLinkMatch) {
    const picsUrl = new URL(picsLinkMatch[1], gsmUrl).href;
    console.log('Fetching pictures page:', picsUrl);
    const pRes = await fetch(picsUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const pHtml = await pRes.text();
    const picListMatch = pHtml.match(/<div id="pictures-list"[^>]*>([\s\S]*?)<\/div>/i);
    if (picListMatch) {
      const imgMatches = [...picListMatch[1].matchAll(/<img[^>]+src=["']?([^"'\s>]+)/gi)];
      for (const m of imgMatches) {
        let src = m[1];
        if (src.endsWith('.jpg') || src.endsWith('.png') || src.endsWith('.webp')) {
          if (src.startsWith('//')) src = 'https:' + src;
          gsmImages.add(src);
        }
      }
    }
  }

  console.log('All collected GSMArena images (' + gsmImages.size + '):', [...gsmImages]);
}

testExtractMultipleImages();

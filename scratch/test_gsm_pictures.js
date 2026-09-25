async function testGsmPictures() {
  const url = 'https://www.gsmarena.com/zte_nubia_navix_ultra_5g-pictures-14946.php';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  const html = await res.text();
  console.log('Pictures page fetch status:', res.status, 'HTML length:', html.length);

  // In GSMArena pictures page, images are in #pictures-list or have .jpg
  const imgRegex = /<img[^>]+src=["']?([^"'\s>]+\/vv\/pics\/[^"'\s>]+|[^"'\s>]+\/vv\/bigpic\/[^"'\s>]+|[^"'\s>]+\/imgroot\/[^"'\s>]+)/gi;
  let m;
  const pics = new Set();
  while ((m = imgRegex.exec(html)) !== null) {
    pics.add(m[1]);
  }
  console.log('Found pictures on GSM pictures page:', [...pics]);

  // Also check <div id="pictures-list">
  const picListMatch = html.match(/<div id="pictures-list"[^>]*>([\s\S]*?)<\/div>/i);
  if (picListMatch) {
    console.log('Found #pictures-list!');
    const pImgs = [...picListMatch[1].matchAll(/src=["']?([^"'\s>]+)/gi)].map(x => x[1]);
    console.log('#pictures-list images:', pImgs);
  }
}

testGsmPictures();

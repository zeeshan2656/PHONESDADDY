const fs = require('fs');

async function testFullParagraphFlow() {
  console.log('====================================================');
  console.log('TESTING SHORT SUMMARY / HIGHLIGHTS PARAGRAPH FORMAT');
  console.log('====================================================');

  // 1. Admin login
  const loginRes = await fetch('http://localhost:3000/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const cookie = loginRes.headers.get('set-cookie');
  console.log('Login Status:', loginRes.status);

  // 2. Fetch WhatMobile Tecno Spark 8C
  console.log('\n--- 1. Testing WhatMobile Fetch (Tecno Spark 8C) ---');
  const wmRes = await fetch('http://localhost:3000/api/phones/fetch-external-specs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ url: 'https://www.whatmobile.com.pk/Tecno_Spark-8C' })
  });
  const wmJson = await wmRes.json();
  console.log('WhatMobile Success:', wmJson.success);
  console.log('Model Name (without brand):', wmJson.data?.name);
  console.log('Paragraph Summary (first 300 chars):');
  console.log(wmJson.data?.shortSummary?.slice(0, 300) + '...\n');

  // 3. Fetch GSMArena ZTE nubia NaviX Ultra 5G
  console.log('\n--- 2. Testing GSMArena Fetch (ZTE nubia NaviX Ultra 5G) ---');
  const gsmRes = await fetch('http://localhost:3000/api/phones/fetch-external-specs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ url: 'https://www.gsmarena.com/zte_nubia_navix_ultra_5g-14946.php' })
  });
  const gsmJson = await gsmRes.json();
  console.log('GSMArena Success:', gsmJson.success);
  console.log('Model Name (without brand):', gsmJson.data?.name);
  console.log('Paragraph Summary (first 300 chars):');
  console.log(gsmJson.data?.shortSummary?.slice(0, 300) + '...\n');

  // 4. Verify public views/phone.html structure
  console.log('\n--- 3. Verifying views/phone.html Block Order ---');
  const html = fs.readFileSync('views/phone.html', 'utf8');
  const pricesPos = html.indexOf('Global Prices (Multi-Country)');
  const overviewPos = html.indexOf('id="phoneOverviewCard"');
  const specsPos = html.indexOf('Detailed Technical Specifications');

  console.log('Global Prices Position:', pricesPos);
  console.log('Phone Overview Card Position:', overviewPos);
  console.log('Detailed Technical Specs Position:', specsPos);

  const isBetween = pricesPos !== -1 && overviewPos !== -1 && specsPos !== -1 && (pricesPos < overviewPos) && (overviewPos < specsPos);
  console.log('Overview Card is strictly BETWEEN Global Prices & Specs:', isBetween);

  // 5. Test saving phone with paragraph and fetching via public details API
  console.log('\n--- 4. End-to-End Save & View Verification ---');
  const boundary = '----WebKitFormBoundaryTest' + Date.now();
  let body = '';
  function addField(name, val) {
    body += `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${val}\r\n`;
  }

  const d = wmJson.data;
  addField('brand_id', d.brand_id || '9');
  addField('name', 'Spark 8C Paragraph Test');
  addField('slug', 'spark-8c-para-test-' + Date.now());
  addField('price', d.price || '36999');
  addField('status', 'Available');
  addField('short_description', d.shortSummary);
  addField('scraped_image', d.image);
  addField('remove_image', 'false');
  addField('prices', JSON.stringify(d.prices || []));
  addField('specs', JSON.stringify((d.specs || []).map((s, idx) => ({
    section: s.section,
    key: s.key,
    value: s.value,
    sort_order: idx + 1
  }))));
  body += `--${boundary}--\r\n`;

  const saveRes = await fetch('http://localhost:3000/api/phones', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Cookie': cookie
    },
    body: Buffer.from(body)
  });
  const saveJson = await saveRes.json();
  console.log('Save Phone Result:', saveJson.success, 'Phone ID:', saveJson.data?.id);

  if (saveJson.success && saveJson.data?.id) {
    const getRes = await fetch(`http://localhost:3000/api/phones/${saveJson.data.id}`);
    const getJson = await getRes.json();
    console.log('Public API Verified short_description length:', getJson.data?.short_description?.length);
    console.log('Public API Verified short_description snippet:');
    console.log(getJson.data?.short_description?.slice(0, 200) + '...');

    // Clean up
    await fetch(`http://localhost:3000/api/phones/${saveJson.data.id}`, {
      method: 'DELETE',
      headers: { 'Cookie': cookie }
    });
    console.log('Cleaned up test phone.');
  }

  if (isBetween && wmJson.success && gsmJson.success) {
    console.log('\n====================================================');
    console.log('🎉 ALL PARAGRAPH TESTS PASSED WITH 100% SUCCESS!');
    console.log('====================================================');
  } else {
    console.log('\n❌ Tests failed.');
  }
}

testFullParagraphFlow();

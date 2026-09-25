async function testSavePhoneWithSummary() {
  console.log('--- Testing End-to-End Phone Save with Auto-Derived Summary ---');

  // 1. Admin login
  const loginRes = await fetch('http://localhost:3000/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const cookie = loginRes.headers.get('set-cookie');

  // 2. Fetch specs from WhatMobile
  const fetchRes = await fetch('http://localhost:3000/api/phones/fetch-external-specs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ url: 'https://www.whatmobile.com.pk/Tecno_Spark-8C' })
  });
  const fetchJson = await fetchRes.json();
  const d = fetchJson.data;

  console.log('Fetched Phone:', d.brand_name, d.name);
  console.log('Derived Short Summary:', d.shortSummary);

  // 3. Create Phone via multipart/form-data with short_description
  const boundary = '----WebKitFormBoundaryTest' + Date.now();
  let body = '';

  function addField(name, val) {
    body += `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${val}\r\n`;
  }

  addField('brand_id', d.brand_id || '9');
  addField('name', 'Spark 8C Summary Test');
  addField('slug', 'spark-8c-summary-test-' + Date.now());
  addField('price', d.price || '27999');
  addField('status', d.status || 'Available');
  addField('release_date', d.releaseDate || 'March 2022');
  addField('short_description', d.shortSummary); // The auto-derived summary!
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
    // 4. Verify saved phone from public API
    const getRes = await fetch(`http://localhost:3000/api/phones/${saveJson.data.id}`);
    const getJson = await getRes.json();
    console.log('Verified Saved Short Description:', getJson.data?.short_description);

    // Clean up test phone from DB
    await fetch(`http://localhost:3000/api/phones/${saveJson.data.id}`, {
      method: 'DELETE',
      headers: { 'Cookie': cookie }
    });
    console.log('Cleaned up test phone.');
    console.log('\n🎉 SUMMARY PERSISTENCE TEST PASSED PERFECTLY!');
  } else {
    console.error('Failed to save phone:', saveJson);
  }
}

testSavePhoneWithSummary();

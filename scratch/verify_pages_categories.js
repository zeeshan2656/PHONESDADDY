const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testAll() {
  console.log('--- Testing Verification of Custom Pages and Categories ---');

  // 1. Admin login to get session cookie
  console.log('\n1. Admin Login...');
  const loginBody = JSON.stringify({ username: 'admin', password: 'admin123' });
  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginBody)
    }
  }, loginBody);

  console.log('Login Status:', loginRes.statusCode);
  const cookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0].split(';')[0] : '';
  console.log('Auth Cookie:', cookie ? 'Obtained' : 'Failed');

  // 2. Test Public Core Pages
  console.log('\n2. Testing Public Page Views...');
  const pagesToTest = ['/about-us', '/contact-us', '/privacy-policy', '/disclaimer', '/page/about-us'];
  for (const p of pagesToTest) {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: p,
      method: 'GET'
    });
    console.log(`GET ${p} -> Status ${res.statusCode} | Has PhonesDaddy: ${res.body.includes('PhonesDaddy')}`);
  }

  // 3. Test Footer Pages API
  console.log('\n3. Testing GET /api/pages/footer...');
  const footerRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/pages/footer',
    method: 'GET'
  });
  console.log('Footer API Status:', footerRes.statusCode);
  const footerJson = JSON.parse(footerRes.body);
  console.log('Footer pages count:', footerJson.data ? footerJson.data.length : 0);
  console.log('Footer page titles:', footerJson.data ? footerJson.data.map(x => x.title).join(', ') : 'none');

  // 4. Test Categories API
  console.log('\n4. Testing GET /api/categories...');
  const catRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/categories',
    method: 'GET'
  });
  console.log('Categories API Status:', catRes.statusCode);
  const catJson = JSON.parse(catRes.body);
  console.log('Categories count:', catJson.data ? catJson.data.length : 0);
  console.log('Categories list:', catJson.data ? catJson.data.map(x => x.name).join(', ') : 'none');

  // 5. Test Admin CRUD on Categories
  console.log('\n5. Testing Admin Category Creation & Deletion...');
  const newCatBody = JSON.stringify({ name: 'Gaming Smartphones', slug: 'gaming-smartphones', description: 'Top tier gaming phones and FPS tests' });
  const createCatRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/categories/admin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(newCatBody),
      'Cookie': cookie
    }
  }, newCatBody);
  console.log('Create Category Status:', createCatRes.statusCode);
  const createCatJson = JSON.parse(createCatRes.body);
  console.log('Created Category ID:', createCatJson.data ? createCatJson.data.id : 'Failed');

  if (createCatJson.data && createCatJson.data.id) {
    const catId = createCatJson.data.id;
    // Delete it
    const delCatRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/admin/categories/admin/${catId}`,
      method: 'DELETE',
      headers: { 'Cookie': cookie }
    });
    console.log('Delete Category Status:', delCatRes.statusCode);
  }

  // 6. Test Admin CRUD on Custom Pages
  console.log('\n6. Testing Admin Custom Page Creation & Deletion...');
  const newPageBody = JSON.stringify({
    title: 'Testing Phones Battery Life',
    slug: 'testing-phones-battery-life',
    content: '<p>This is a complete breakdown of our 2026 battery endurance testing protocol.</p>',
    meta_title: 'Battery Endurance Testing — PhonesDaddy',
    meta_description: 'How we test smartphone batteries with standardized loops and gaming.',
    status: 'published',
    show_in_footer: 1
  });
  const createPageRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/pages/admin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(newPageBody),
      'Cookie': cookie
    }
  }, newPageBody);
  console.log('Create Page Status:', createPageRes.statusCode);
  const createPageJson = JSON.parse(createPageRes.body);
  console.log('Created Page ID:', createPageJson.data ? createPageJson.data.id : 'Failed');

  if (createPageJson.data && createPageJson.data.id) {
    const pageId = createPageJson.data.id;
    // Verify view
    const viewRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/page/testing-phones-battery-life',
      method: 'GET'
    });
    console.log('Public view of new page Status:', viewRes.statusCode, '| Contains Battery Endurance:', viewRes.body.includes('battery endurance testing protocol'));

    // Delete it
    const delPageRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/admin/pages/admin/${pageId}`,
      method: 'DELETE',
      headers: { 'Cookie': cookie }
    });
    console.log('Delete Page Status:', delPageRes.statusCode);
  }

  // 7. Test Admin HTML Pages
  console.log('\n7. Testing Admin Views HTTP status...');
  const adminViews = ['/admin/pages', '/admin/pages/new', '/admin/categories'];
  for (const v of adminViews) {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: v,
      method: 'GET',
      headers: { 'Cookie': cookie }
    });
    console.log(`Admin View GET ${v} -> Status: ${res.statusCode} | Length: ${res.body.length}`);
  }

  console.log('\n✅ All tests finished!');
}

testAll().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

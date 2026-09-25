const fs = require('fs');
const path = require('path');

async function runTests() {
  const baseUrl = 'http://localhost:3000';

  console.log('1. Logging in as admin...');
  const loginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });

  const loginJson = await loginRes.json();
  console.log('Login response:', loginJson);
  if (!loginJson.success) {
    throw new Error('Login failed');
  }

  // Extract session cookie
  const cookieHeader = loginRes.headers.get('set-cookie');
  console.log('Session Cookie:', cookieHeader ? cookieHeader.split(';')[0] : 'None');
  const cookie = cookieHeader ? cookieHeader.split(';')[0] : '';

  // 2. Test inline image upload
  console.log('\n2. Testing /api/news/admin/upload-inline-image...');
  // Create a 1x1 transparent PNG buffer
  const samplePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  const form1 = new FormData();
  const blob = new Blob([samplePngBuffer], { type: 'image/png' });
  form1.append('image', blob, 'sample-test.png');

  const uploadRes = await fetch(`${baseUrl}/api/news/admin/upload-inline-image`, {
    method: 'POST',
    headers: {
      'Cookie': cookie
    },
    body: form1
  });

  const uploadText = await uploadRes.text();
  console.log('Upload status:', uploadRes.status);
  console.log('Upload response:', uploadText);

  // 3. Test article update (PUT /api/news/admin/7)
  console.log('\n3. Testing PUT /api/news/admin/7...');
  const form2 = new FormData();
  form2.append('title', 'Test Blog Post Updated Successfully');
  form2.append('slug', 'test-blog-post');
  form2.append('summary', 'Updated summary test');
  form2.append('author', 'Test Author');
  form2.append('category', 'Hot News');
  form2.append('status', 'published');
  form2.append('is_hot', '1');
  form2.append('content', '<p>Updated content test with rich formatting.</p>');

  const updateRes = await fetch(`${baseUrl}/api/news/admin/7`, {
    method: 'PUT',
    headers: {
      'Cookie': cookie
    },
    body: form2
  });

  const updateText = await updateRes.text();
  console.log('Update status:', updateRes.status);
  console.log('Update response:', updateText);

  // 4. Test fetch article by ID
  console.log('\n4. Testing GET /api/news/admin/7...');
  const getRes = await fetch(`${baseUrl}/api/news/admin/7`, {
    headers: { 'Cookie': cookie }
  });
  const getJson = await getRes.json();
  console.log('Get status:', getRes.status, 'Title in DB:', getJson.data ? getJson.data.title : 'N/A');

  console.log('\nALL TESTS COMPLETE!');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

const fs = require('fs');

async function testCreate() {
  const baseUrl = 'http://localhost:3000';

  const loginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const cookie = loginRes.headers.get('set-cookie').split(';')[0];

  const samplePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  const form = new FormData();
  form.append('title', 'Brand New Article Test');
  form.append('slug', 'brand-new-article-test');
  form.append('summary', 'Testing article creation with cover image');
  form.append('author', 'Test Admin');
  form.append('category', 'Launch Events');
  form.append('status', 'published');
  form.append('is_hot', '0');
  form.append('content', '<h2>Brand New Content</h2><p>Full rich text test.</p>');
  const blob = new Blob([samplePngBuffer], { type: 'image/png' });
  form.append('image', blob, 'cover-test.png');

  const res = await fetch(`${baseUrl}/api/news/admin`, {
    method: 'POST',
    headers: { 'Cookie': cookie },
    body: form
  });

  const json = await res.json();
  console.log('Create result:', json);
}

testCreate().catch(console.error);

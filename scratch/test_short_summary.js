const fs = require('fs');

async function testFetchAndSummary() {
  console.log('--- Testing Short Summary Auto-Generation & API Fetch ---');

  // Login as admin first
  const loginRes = await fetch('http://localhost:3000/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const cookie = loginRes.headers.get('set-cookie');
  console.log('Admin login status:', loginRes.status, cookie ? 'Session acquired' : 'No cookie');

  // Test 1: WhatMobile fetch
  console.log('\n1. Fetching WhatMobile: Tecno Spark 8C...');
  try {
    const wmRes = await fetch('http://localhost:3000/api/phones/fetch-external-specs', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookie || ''
      },
      body: JSON.stringify({ url: 'https://www.whatmobile.com.pk/Tecno_Spark-8C' })
    });
    const wmJson = await wmRes.json();
    console.log('WhatMobile success:', wmJson.success);
    console.log('Model Name (without brand):', wmJson.data?.name);
    console.log('Brand Name:', wmJson.data?.brand_name);
    console.log('Short Summary / Highlights:\n ->', wmJson.data?.shortSummary);
    console.log('Image:', wmJson.data?.image);
  } catch (err) {
    console.error('WhatMobile fetch failed:', err.message);
  }

  // Test 2: GSMArena fetch
  console.log('\n2. Fetching GSMArena: ZTE nubia NaviX Ultra 5G...');
  try {
    const gsmRes = await fetch('http://localhost:3000/api/phones/fetch-external-specs', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookie || ''
      },
      body: JSON.stringify({ url: 'https://www.gsmarena.com/zte_nubia_navix_ultra_5g-14946.php' })
    });
    const gsmJson = await gsmRes.json();
    console.log('GSMArena success:', gsmJson.success);
    console.log('Model Name (without brand):', gsmJson.data?.name);
    console.log('Brand Name:', gsmJson.data?.brand_name);
    console.log('Short Summary / Highlights:\n ->', gsmJson.data?.shortSummary);
    console.log('Image:', gsmJson.data?.image);
  } catch (err) {
    console.error('GSMArena fetch failed:', err.message);
  }

  // Test 3: HTML Structure Verification
  console.log('\n3. Verifying admin/phone-form.html structure...');
  const html = fs.readFileSync('admin/phone-form.html', 'utf8');
  const hasSummaryCard = html.includes('3. Short Summary / Key Highlights');
  const hasSpecsCard = html.includes('4. Detailed Technical Specifications Builder');
  const hasAutoGenerateBtn = html.includes('id="btnAutoGenerateSummary"');
  const summaryPos = html.indexOf('3. Short Summary / Key Highlights');
  const specsPos = html.indexOf('4. Detailed Technical Specifications Builder');
  const pricingPos = html.indexOf('2. Global Multi-Country Pricing');

  console.log('Has Summary Card:', hasSummaryCard);
  console.log('Has Specs Card:', hasSpecsCard);
  console.log('Has Auto-Generate Button:', hasAutoGenerateBtn);
  console.log('Card Order (Pricing < Summary < Specs):', pricingPos < summaryPos && summaryPos < specsPos);

  if (hasSummaryCard && hasSpecsCard && pricingPos < summaryPos && summaryPos < specsPos) {
    console.log('\n✅ ALL VERIFICATION CHECKS PASSED!');
  } else {
    console.log('\n❌ Verification check failed.');
  }
}

testFetchAndSummary();

const fs = require('fs');
const { parseGSMArena, parseWhatMobile } = require('../server/utils/phoneScraper');

const gsmHtml = fs.readFileSync('C:/Users/Basharat/.gemini/antigravity-ide/brain/d3c0c4c1-a5da-48f0-80b2-dc25342b53a5/scratch/gsm_sample.html', 'utf8');
const wmHtml = fs.readFileSync('C:/Users/Basharat/.gemini/antigravity-ide/brain/d3c0c4c1-a5da-48f0-80b2-dc25342b53a5/scratch/wm_sample.html', 'utf8');

const gsmData = parseGSMArena(gsmHtml, 'https://www.gsmarena.com/zte_nubia_navix_ultra_5g-14946.php');
const wmData = parseWhatMobile(wmHtml, 'https://www.whatmobile.com.pk/Tecno_Spark-8C');

function generateSpecsParagraph({ specs, name, brand, pricePKR, priceUSD, releaseDate }) {
  const fullName = brand && !name.toLowerCase().startsWith(brand.toLowerCase()) ? `${brand} ${name}` : name;
  
  function findSpec(secRegex, keyRegex) {
    const item = (specs || []).find(s => secRegex.test(s.section || '') && keyRegex.test(s.key || ''));
    return item ? item.value : '';
  }

  const displaySizeVal = findSpec(/display/i, /size/i);
  const displayTypeVal = findSpec(/display/i, /type|technology/i);
  const displayResVal = findSpec(/display/i, /resolution/i);
  const displayExtra = findSpec(/display/i, /extra|refresh/i);

  const chipsetVal = findSpec(/platform|processor/i, /chipset|cpu|processor/i);
  const osVal = findSpec(/platform/i, /os/i);
  const gpuVal = findSpec(/platform/i, /gpu/i);

  const memoryVal = findSpec(/memory/i, /internal|built-in|storage/i);
  const ramVal = findSpec(/memory/i, /ram/i);
  const romVal = findSpec(/memory/i, /internal storage|rom/i);

  const mainCamVal = findSpec(/camera|main camera/i, /triple|dual|single|quad|main/i);
  const selfieVal = findSpec(/selfie|camera/i, /single|front|selfie/i);

  const batteryVal = findSpec(/battery/i, /capacity|type/i);
  const chargingVal = findSpec(/battery/i, /charging|fast charging/i);
  const fingerprintVal = findSpec(/features/i, /fingerprint|sensors/i);

  const lines = [];

  // Title header
  lines.push(`${fullName} price in Pakistan`);

  let priceStr = pricePKR ? (pricePKR.startsWith('PKR') || pricePKR.startsWith('Rs') ? pricePKR : `Rs. ${pricePKR}`) : '';
  if (!priceStr) priceStr = 'is expected to be announced soon';
  else priceStr = `is expected to be ${priceStr}`;

  let releaseStr = releaseDate ? ` ${fullName} is expected to be launched on ${releaseDate}.` : '';
  
  let memVariant = '';
  if (ramVal && romVal) {
    memVariant = ` This is ${ramVal} / ${romVal} variant of ${brand || fullName}.`;
  } else if (memoryVal) {
    const cleanMem = memoryVal.split(';')[0].replace(/\(.*?\)/g, '').trim();
    if (cleanMem) memVariant = ` This is ${cleanMem} variant of ${brand || fullName}.`;
  }

  lines.push(`${fullName} price in Pakistan ${priceStr}.${releaseStr}${memVariant}`);

  if (pricePKR) {
    lines.push(`Expected Price of ${fullName} in Pakistan is ${pricePKR.startsWith('PKR') ? pricePKR.replace('PKR', 'Rs.') : pricePKR}.`);
  }
  if (priceUSD) {
    lines.push(`Expected Price of ${brand || fullName} in USD is ${priceUSD.startsWith('$') ? priceUSD : '$' + priceUSD.replace(/USD\s*/i, '')}.`);
  }

  let tagline = `${fullName} - Powerful & Stylish Device!`;
  if (batteryVal && /\b(6000|7000|6500)\s*mAh/i.test(batteryVal)) {
    tagline = `${fullName} - A Big Battery Smartphone!`;
  } else if (mainCamVal && /\b(108|200|50)\s*MP/i.test(mainCamVal)) {
    tagline = `${fullName} - High Resolution Camera Phone!`;
  }

  let story = `${tagline}\n`;
  story += `${fullName} is officially introduced with cutting-edge mobile hardware. `;

  if (chipsetVal) {
    story += `The smartphone is powered by the capable ${chipsetVal.replace(/\(.*?\)/g, '').trim()} chipset, providing smooth multitasking and reliable speed. `;
  }
  if (gpuVal) {
    story += `Graphical performance and gaming are handled by the ${gpuVal.replace(/\(.*?\)/g, '').trim()} GPU. `;
  }

  if (displaySizeVal || displayTypeVal) {
    let dispDesc = [];
    if (displaySizeVal) dispDesc.push(displaySizeVal.match(/[\d.]+\s*(?:inches|inch|")/i)?.[0] || displaySizeVal.split(',')[0]);
    if (displayTypeVal) dispDesc.push(displayTypeVal.split(',')[0]);
    if (displayExtra && /\d+Hz/i.test(displayExtra)) dispDesc.push(displayExtra.match(/\d+Hz/i)?.[0]);
    if (displayResVal) dispDesc.push(`with a crisp resolution of ${displayResVal.split(',')[0].trim()}`);
    story += `On the front, ${fullName} features a stunning ${dispDesc.join(' ')} display, delivering rich colors and immersive viewing angles. `;
  }

  if (mainCamVal) {
    story += `In the optics department, the handset will come equipped with a ${mainCamVal.split('\n')[0].replace(/\(.*?\)/g, '').trim()} setup for sharp photos and stabilized video recording. `;
  }
  if (selfieVal) {
    story += `The selfie shooter of the phone will be a ${selfieVal.split('\n')[0].replace(/\(.*?\)/g, '').trim()} sensor. `;
  }

  if (memoryVal || ramVal) {
    const memDesc = (ramVal && romVal) ? `${ramVal} RAM and ${romVal} storage` : (memoryVal ? memoryVal.split(',')[0].trim() : '');
    if (memDesc) {
      story += `It offers ${memDesc} to comfortably store apps, photos, and high-definition media without running out of space. `;
    }
  }

  if (batteryVal) {
    const mahMatch = batteryVal.match(/\d{3,5}\s*mAh/i)?.[0] || batteryVal.split(',')[0];
    const chargingStr = chargingVal ? ` backed by ${chargingVal.split(',')[0].trim()}` : '';
    story += `The handset is fueled with a generous ${mahMatch} battery${chargingStr}, ensuring full-day battery endurance with ease. `;
  }

  if (osVal) {
    story += `The device runs on ${osVal.split(',')[0].trim()}, offering an intuitive user experience and the latest security updates. `;
  }
  if (fingerprintVal) {
    story += `Security features include a fast ${fingerprintVal.split(',')[0].trim()}. `;
  }

  story += `The coming ${fullName} will be a strong contender in its market segment.`;

  lines.push('');
  lines.push(story);

  return lines.join('\n');
}

console.log('--- Generated GSMArena Paragraph ---');
console.log(generateSpecsParagraph({
  specs: gsmData.specs,
  name: gsmData.name,
  brand: gsmData.brand,
  pricePKR: gsmData.prices?.find(p => p.country === 'Pakistan')?.amount,
  priceUSD: gsmData.prices?.find(p => p.country === 'USA')?.amount,
  releaseDate: gsmData.releaseDate
}));


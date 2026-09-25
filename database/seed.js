const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Ensure upload directories exist
const uploadDirs = [
  path.join(__dirname, '../server/uploads/phones'),
  path.join(__dirname, '../server/uploads/brands'),
  path.join(__dirname, '../public/images/phones'),
  path.join(__dirname, '../public/images/brands')
];

for (const dir of uploadDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Generate an SVG image for phone
function generatePhoneSvg(phoneName, brandName, primaryColor = '#0d9488', accentColor = '#115e59') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
  <defs>
    <linearGradient id="bodyGrad_${brandName.replace(/\s+/g,'_')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="${accentColor}"/>
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <radialGradient id="camGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="60%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.2"/>
    </filter>
  </defs>
  
  <!-- Outer Body Frame -->
  <rect x="75" y="30" width="250" height="440" rx="36" fill="url(#bodyGrad_${brandName.replace(/\s+/g,'_')})" filter="url(#shadow)"/>
  
  <!-- Bezel -->
  <rect x="80" y="35" width="240" height="430" rx="32" fill="#020617"/>
  
  <!-- Screen -->
  <rect x="85" y="40" width="230" height="420" rx="28" fill="url(#screenGrad)"/>
  
  <!-- Wallpaper Glow Effect -->
  <circle cx="200" cy="220" r="80" fill="${primaryColor}" opacity="0.18"/>
  <circle cx="240" cy="300" r="70" fill="#38bdf8" opacity="0.12"/>
  
  <!-- Punch Hole / Dynamic Island -->
  <rect x="180" y="48" width="40" height="12" rx="6" fill="#000000"/>
  <circle cx="188" cy="54" r="3.5" fill="#1e293b"/>
  
  <!-- Screen Details -->
  <text x="200" y="160" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700" fill="#f8fafc" text-anchor="middle">12:00</text>
  <text x="200" y="185" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="#94a3b8" text-anchor="middle">5G • PhonesDaddy</text>
  
  <!-- Brand watermark -->
  <text x="200" y="270" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#ffffff" opacity="0.8" text-anchor="middle">${phoneName}</text>
  <text x="200" y="290" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="500" fill="#38bdf8" opacity="0.9" text-anchor="middle">${brandName}</text>
  
  <!-- Bottom Bar Indicator -->
  <rect x="160" y="445" width="80" height="4" rx="2" fill="#cbd5e1" opacity="0.7"/>
</svg>`;
}

// Generate brand logo SVG
function generateBrandSvg(name, color = '#0f172a') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60" width="160" height="60">
    <rect width="100%" height="100%" fill="transparent"/>
    <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="${color}" letter-spacing="1">
      ${name.toUpperCase()}
    </text>
  </svg>`;
}

const brandsData = [
  { name: 'Samsung', slug: 'samsung', color: '#1428a0', desc: 'Samsung Electronics is a global leader in smartphone innovation, displays, and cutting-edge Galaxy devices.' },
  { name: 'Apple', slug: 'apple', color: '#555555', desc: 'Apple Inc. designs premium iPhones featuring iOS, custom A-series and M-series chips, and high-resolution Super Retina displays.' },
  { name: 'Xiaomi', slug: 'xiaomi', color: '#ff6900', desc: 'Xiaomi offers innovative, value-for-money smartphones with flagship camera sensors and hyper-fast charging.' },
  { name: 'Vivo', slug: 'vivo', color: '#415fff', desc: 'Vivo is known for professional mobile photography, Zeiss optics collaboration, and slim aesthetic designs.' },
  { name: 'Oppo', slug: 'oppo', color: '#008453', desc: 'Oppo specializes in portrait photography, SuperVOOC flash charging, and stylish Reno and Find series.' },
  { name: 'OnePlus', slug: 'oneplus', color: '#eb0028', desc: 'OnePlus creates high-performance flagship smartphones with smooth OxygenOS and rapid Warp Charging.' },
  { name: 'Google', slug: 'google', color: '#4285f4', desc: 'Google Pixel phones offer the ultimate pure Android experience, computational photography, and Tensor AI power.' },
  { name: 'Realme', slug: 'realme', color: '#ffc915', desc: 'Realme delivers trendsetting tech, high refresh rates, and gaming performance targeted at young consumers.' },
  { name: 'Tecno', slug: 'tecno', color: '#0072ce', desc: 'Tecno produces feature-packed affordable smartphones with vibrant screens and long-lasting batteries.' },
  { name: 'Infinix', slug: 'infinix', color: '#00a850', desc: 'Infinix is renowned for high-spec budget gaming phones and fast charging technology.' },
  { name: 'Motorola', slug: 'motorola', color: '#001435', desc: 'Motorola builds durable smartphones with clean stock Android interfaces and innovative foldable Razr devices.' },
  { name: 'Huawei', slug: 'huawei', color: '#cf0a2c', desc: 'Huawei pioneers telecommunications, XMAGE smartphone photography, and quad-curved premium hardware.' },
  { name: 'Sony', slug: 'sony', color: '#000000', desc: 'Sony Xperia phones feature pro Alpha camera controls, 4K OLED displays, and dedicated audio hardware.' },
  { name: 'Honor', slug: 'honor', color: '#0066cc', desc: 'Honor produces sleek flagship smartphones with advanced silicon-carbon batteries and ultra-high PWM dimming.' }
];

const phonesData = [
  // 1. Samsung Galaxy S26 Ultra
  {
    brand: 'samsung',
    name: 'Samsung Galaxy S26 Ultra',
    slug: 'samsung-galaxy-s26-ultra',
    release_date: 'September 2026',
    status: 'Upcoming',
    price: 389999,
    featured: 1,
    popular: 1,
    short_desc: 'Next-gen flagship with 200MP Quad-Tele camera, Snapdragon 8 Elite Gen 2, built-in S-Pen, and 6.8" 1-120Hz Dynamic AMOLED 2X.',
    prices: { Pakistan: 'PKR 389,999', USA: 'USD 1,299', UAE: 'AED 4,899', India: 'INR 134,999', UK: 'GBP 1,249' },
    specs: {
      Network: { Technology: 'GSM / CDMA / HSPA / EVDO / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 1700 / 1900 / 2100', '4G': '1, 2, 3, 4, 5, 7, 8, 12, 20, 28, 38, 40, 41, 66', '5G': 'SA/NSA/Sub6/mmWave', Speed: 'HSPA, LTE-A (up to 7CA), 5G' },
      Launch: { Announced: '2026, August', Status: 'Upcoming. Exp. release September 2026', 'Release Date': 'September 2026' },
      Body: { Dimensions: '162.3 x 79.0 x 8.4 mm', Weight: '232 g', Build: 'Glass front (Gorilla Armor 2), glass back, Titanium frame (grade 5)', SIM: 'Nano-SIM and eSIM or Dual SIM', Colors: 'Titanium Black, Titanium Gray, Titanium Violet, Titanium Yellow' },
      Display: { Type: 'Dynamic LTPO AMOLED 2X, 120Hz, HDR10+, 3000 nits (peak)', Size: '6.8 inches, 113.5 cm2 (~88.5% screen-to-body ratio)', Resolution: '1440 x 3120 pixels, 19.5:9 ratio (~505 ppi density)', Protection: 'Corning Gorilla Armor 2', 'Refresh Rate': '1-120Hz Adaptive', Brightness: '3000 nits' },
      Platform: { OS: 'Android 17, One UI 8.1', Chipset: 'Qualcomm Snapdragon 8 Elite Gen 2 (3 nm)', CPU: 'Octa-core (2x4.4 GHz Oryon + 6x3.6 GHz Oryon)', GPU: 'Adreno 840' },
      Memory: { RAM: '12GB / 16GB LPDDR5X', 'Internal Storage': '256GB / 512GB / 1TB UFS 4.1', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Quad Camera: 200MP + 50MP + 50MP + 12MP', 'Main sensor': '200 MP, f/1.7, 24mm (wide), 1/1.3", multi-directional PDAF, OIS', Ultrawide: '50 MP, f/1.9, 120˚ (ultrawide), dual pixel PDAF', Telephoto: '50 MP, f/3.4, 115mm (periscope telephoto), 5x optical zoom + 50MP 3x telephoto', Features: 'Laser AF, LED flash, auto-HDR, panorama, Best Take AI', Video: '8K@30fps, 4K@30/60/120fps, 1080p@30/60/240fps, HDR10+, gyro-EIS' },
      'Selfie Camera': { Camera: '12 MP, f/2.2, 26mm (wide), Dual Pixel PDAF', Features: 'Dual video call, Auto-HDR, HDR10+', Video: '4K@30/60fps, 1080p@30fps' },
      Sound: { Loudspeaker: 'Yes, with stereo speakers (tuned by AKG)', '3.5mm Jack': 'No (32-bit/384kHz audio)' },
      Connectivity: { WLAN: 'Wi-Fi 802.11 a/b/g/n/ac/6e/7, tri-band, Wi-Fi Direct', Bluetooth: '5.4, A2DP, LE', GPS: 'GPS, GLONASS, BDS, GALILEO, QZSS, NavIC', NFC: 'Yes', USB: 'USB Type-C 3.2, DisplayPort 1.2, OTG', Infrared: 'No' },
      Features: { Sensors: 'Fingerprint (under display, ultrasonic), accelerometer, gyro, proximity, compass, barometer', Fingerprint: 'Under-display Ultrasonic', 'Face Unlock': 'Yes (2D AI Face Recognition)', 'Other Features': 'Samsung DeX, Ultra Wideband (UWB) support, S-Pen with Bluetooth latency 2.8ms' },
      Battery: { Capacity: '5000 mAh non-removable', Type: 'Li-Ion', Charging: '65W wired, PD3.0, 65% in 25 min', 'Wireless Charging': '25W wireless (Qi2/PMA)', 'Reverse Charging': '4.5W reverse wireless' },
      Price: { Pakistan: 'PKR 389,999', USA: 'USD 1,299', UAE: 'AED 4,899', India: 'INR 134,999', UK: 'GBP 1,249' }
    }
  },
  // 2. Apple iPhone 17 Pro Max
  {
    brand: 'apple',
    name: 'Apple iPhone 17 Pro Max',
    slug: 'apple-iphone-17-pro-max',
    release_date: 'September 2026',
    status: 'Upcoming',
    price: 449999,
    featured: 1,
    popular: 1,
    short_desc: 'Apple flagship featuring A20 Pro 2nm Bionic chip, 48MP Triple Fusion Camera, anti-reflective Ceramic Shield 2, and Apple Intelligence.',
    prices: { Pakistan: 'PKR 449,999', USA: 'USD 1,399', UAE: 'AED 5,299', India: 'INR 159,900', UK: 'GBP 1,399' },
    specs: {
      Network: { Technology: 'GSM / CDMA / HSPA / EVDO / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 1700 / 1900 / 2100', '4G': 'All LTE Bands with 4x4 MIMO', '5G': 'SA/NSA/Sub6/mmWave', Speed: 'HSPA, LTE, 5G Gigabit' },
      Launch: { Announced: '2026, September', Status: 'Upcoming', 'Release Date': 'September 2026' },
      Body: { Dimensions: '163.0 x 77.6 x 8.25 mm', Weight: '227 g', Build: 'Ceramic Shield front, textured matte glass back, Titanium frame', SIM: 'Nano-SIM and eSIM or Dual eSIM', Colors: 'Desert Titanium, Natural Titanium, White Titanium, Black Titanium' },
      Display: { Type: 'LTPO Super Retina XDR OLED, 120Hz ProMotion, HDR10, Dolby Vision, 3000 nits', Size: '6.9 inches, 115.6 cm2 (~91.4% screen-to-body ratio)', Resolution: '1320 x 2868 pixels, 19.5:9 ratio (~460 ppi density)', Protection: 'Ceramic Shield Glass Gen 2', 'Refresh Rate': '1-120Hz ProMotion', Brightness: '3000 nits peak' },
      Platform: { OS: 'iOS 20', Chipset: 'Apple A20 Pro (2 nm)', CPU: 'Hexa-core (2 performance + 4 efficiency)', GPU: 'Apple GPU (6-core graphics with Neural Accelerators)' },
      Memory: { RAM: '12GB Unified RAM', 'Internal Storage': '256GB / 512GB / 1TB / 2TB NVMe', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Triple 48MP + 48MP + 48MP + TOF 3D LiDAR scanner', 'Main sensor': '48 MP, f/1.78, 24mm (wide), second-gen sensor-shift OIS', Ultrawide: '48 MP, f/2.2, 13mm, 120˚ (ultrawide), hybrid focus pixels', Telephoto: '48 MP, f/2.8, 120mm (periscope telephoto), 5x optical zoom, 3D sensor-shift OIS', Features: 'Dual-LED dual-tone flash, HDR (photos/panorama), Spatial video recording', Video: '4K@24/25/30/60/120fps ProRes, 1080p@30/60/120/240fps, Dolby Vision HDR, Log' },
      'Selfie Camera': { Camera: '24 MP, f/1.9, 23mm (wide), PDAF, OIS', Features: 'HDR, Cinematic mode (4K@30fps)', Video: '4K@24/25/30/60fps, 1080p@30/60/120fps, gyro-EIS' },
      Sound: { Loudspeaker: 'Yes, with spatial stereo speakers', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 802.11 a/b/g/n/ac/6e/7, dual-band, hotspot', Bluetooth: '5.4, A2DP, LE', GPS: 'Precision dual-frequency GPS (L1+L5), GLONASS, GALILEO, BDS, QZSS, NavIC', NFC: 'Yes', USB: 'USB Type-C 3.2 Gen 2 (up to 10Gbps), DisplayPort', Infrared: 'No' },
      Features: { Sensors: 'Face ID, LiDAR scanner, accelerometer, gyro, proximity, compass, barometer', Fingerprint: 'No (Face ID 3D)', 'Face Unlock': 'Yes (Face ID hardware)', 'Other Features': 'Action button, Camera Control capacitive key, Apple Intelligence, Emergency SOS via satellite' },
      Battery: { Capacity: '4850 mAh non-removable', Type: 'Li-Ion', Charging: 'Wired 50% in 25 min, USB Power Delivery 3.0', 'Wireless Charging': '25W MagSafe, 15W Qi2', 'Reverse Charging': '4.5W reverse wired' },
      Price: { Pakistan: 'PKR 449,999', USA: 'USD 1,399', UAE: 'AED 5,299', India: 'INR 159,900', UK: 'GBP 1,399' }
    }
  },
  // 3. Samsung Galaxy S25 Ultra
  {
    brand: 'samsung',
    name: 'Samsung Galaxy S25 Ultra',
    slug: 'samsung-galaxy-s25-ultra',
    release_date: 'February 2025',
    status: 'Available',
    price: 349999,
    featured: 1,
    popular: 1,
    short_desc: 'Titanium framed flagship with 200MP camera, Snapdragon 8 Elite, 5000mAh battery, and flat 6.8" 120Hz display.',
    prices: { Pakistan: 'PKR 349,999', USA: 'USD 1,199', UAE: 'AED 4,499', India: 'INR 124,999', UK: 'GBP 1,199' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 1900 / 2100', '4G': '1, 2, 3, 4, 5, 7, 8, 12, 20, 28, 38, 40, 41', '5G': 'SA/NSA/Sub6', Speed: 'HSPA, LTE-A, 5G' },
      Launch: { Announced: '2025, January', Status: 'Available. Released 2025, February', 'Release Date': 'February 2025' },
      Body: { Dimensions: '162.8 x 77.6 x 8.2 mm', Weight: '219 g', Build: 'Glass front (Gorilla Armor), glass back, Titanium frame', SIM: 'Nano-SIM and eSIM', Colors: 'Titanium Silver, Titanium Blue, Titanium Gray, Titanium Black' },
      Display: { Type: 'Dynamic LTPO AMOLED 2X, 120Hz, HDR10+, 2600 nits', Size: '6.8 inches (~89.5% screen-to-body ratio)', Resolution: '1440 x 3120 pixels (~505 ppi density)', Protection: 'Gorilla Armor', 'Refresh Rate': '1-120Hz', Brightness: '2600 nits' },
      Platform: { OS: 'Android 15, One UI 7', Chipset: 'Qualcomm Snapdragon 8 Elite (3 nm)', CPU: 'Octa-core (2x4.32 GHz Oryon + 6x3.53 GHz Oryon)', GPU: 'Adreno 830' },
      Memory: { RAM: '12GB / 16GB', 'Internal Storage': '256GB / 512GB / 1TB', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Quad: 200MP + 50MP + 50MP + 10MP', 'Main sensor': '200 MP, f/1.7, 24mm (wide), multi-directional PDAF, OIS', Ultrawide: '50 MP, f/2.0, 120˚', Telephoto: '50 MP (5x periscope) + 10 MP (3x telephoto)', Features: 'LED flash, auto-HDR, panorama', Video: '8K@30fps, 4K@60/120fps' },
      'Selfie Camera': { Camera: '12 MP, f/2.2, Dual Pixel PDAF', Features: 'Dual video call, Auto-HDR', Video: '4K@60fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 7, tri-band', Bluetooth: '5.3', GPS: 'GPS, GLONASS, BDS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 3.2', Infrared: 'No' },
      Features: { Sensors: 'Ultrasonic fingerprint, accelerometer, gyro, compass', Fingerprint: 'Under display, ultrasonic', 'Face Unlock': 'Yes', 'Other Features': 'S-Pen stylus, IP68 dust/water resistant' },
      Battery: { Capacity: '5000 mAh', Type: 'Li-Ion', Charging: '45W wired, 65% in 30 min', 'Wireless Charging': '15W wireless', 'Reverse Charging': '4.5W reverse wireless' },
      Price: { Pakistan: 'PKR 349,999', USA: 'USD 1,199', UAE: 'AED 4,499', India: 'INR 124,999', UK: 'GBP 1,199' }
    }
  },
  // 4. Apple iPhone 16 Pro Max
  {
    brand: 'apple',
    name: 'Apple iPhone 16 Pro Max',
    slug: 'apple-iphone-16-pro-max',
    release_date: 'September 2024',
    status: 'Available',
    price: 399999,
    featured: 1,
    popular: 1,
    short_desc: 'Grade 5 Titanium design with Camera Control button, 48MP Fusion camera, A18 Pro chip, and 6.9-inch Super Retina XDR.',
    prices: { Pakistan: 'PKR 399,999', USA: 'USD 1,199', UAE: 'AED 4,699', India: 'INR 144,900', UK: 'GBP 1,199' },
    specs: {
      Network: { Technology: 'GSM / CDMA / HSPA / EVDO / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': '1, 2, 3, 4, 5, 7, 8, 12, 20, 28, 38, 41', '5G': 'SA/NSA/Sub6', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, September', Status: 'Available. Released 2024, September', 'Release Date': 'September 2024' },
      Body: { Dimensions: '163.0 x 77.6 x 8.3 mm', Weight: '227 g', Build: 'Ceramic Shield front, glass back, Titanium frame', SIM: 'Nano-SIM and eSIM', Colors: 'Black Titanium, White Titanium, Natural Titanium, Desert Titanium' },
      Display: { Type: 'LTPO Super Retina XDR OLED, 120Hz, Dolby Vision, 2000 nits', Size: '6.9 inches (~91.4% screen-to-body ratio)', Resolution: '1320 x 2868 pixels (~460 ppi density)', Protection: 'Ceramic Shield Glass', 'Refresh Rate': '120Hz ProMotion', Brightness: '2000 nits peak' },
      Platform: { OS: 'iOS 18, upgradable to iOS 19', Chipset: 'Apple A18 Pro (3 nm)', CPU: 'Hexa-core (2x4.04 GHz + 4x2.20 GHz)', GPU: 'Apple GPU (6-core graphics)' },
      Memory: { RAM: '8GB', 'Internal Storage': '256GB / 512GB / 1TB NVMe', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Triple: 48MP + 12MP + 48MP', 'Main sensor': '48 MP, f/1.8, 24mm (wide), dual pixel PDAF, sensor-shift OIS', Ultrawide: '48 MP, f/2.2, 13mm (ultrawide)', Telephoto: '12 MP, f/2.8, 120mm (periscope telephoto), 5x optical zoom', Features: 'Dual-LED dual-tone flash, HDR, stereo sound recording', Video: '4K@24/25/30/60/100/120fps, 1080p@30/60/120/240fps' },
      'Selfie Camera': { Camera: '12 MP, f/1.9, 23mm, PDAF, OIS', Features: 'HDR, Cinematic mode 4K', Video: '4K@60fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 7', Bluetooth: '5.3', GPS: 'Dual-band GPS, GLONASS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 3.2 Gen 2, DisplayPort', Infrared: 'No' },
      Features: { Sensors: 'Face ID, LiDAR scanner, accelerometer, gyro, compass, barometer', Fingerprint: 'No (Face ID)', 'Face Unlock': 'Yes', 'Other Features': 'Camera Control button, Action button, Apple Intelligence' },
      Battery: { Capacity: '4685 mAh', Type: 'Li-Ion', Charging: 'Wired, 50% in 30 min', 'Wireless Charging': '25W MagSafe, 15W Qi2', 'Reverse Charging': '4.5W reverse wired' },
      Price: { Pakistan: 'PKR 399,999', USA: 'USD 1,199', UAE: 'AED 4,699', India: 'INR 144,900', UK: 'GBP 1,199' }
    }
  },
  // 5. Xiaomi 15 Ultra
  {
    brand: 'xiaomi',
    name: 'Xiaomi 15 Ultra',
    slug: 'xiaomi-15-ultra',
    release_date: 'March 2025',
    status: 'Available',
    price: 319999,
    featured: 1,
    popular: 1,
    short_desc: 'Leica Quad Camera system with 1-inch sensor, 200MP periscope zoom, Snapdragon 8 Elite, and 6000mAh battery.',
    prices: { Pakistan: 'PKR 319,999', USA: 'USD 1,099', UAE: 'AED 3,999', India: 'INR 99,999', UK: 'GBP 1,099' },
    specs: {
      Network: { Technology: 'GSM / CDMA / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 1900 / 2100', '4G': 'LTE Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2025, February', Status: 'Available. Released March 2025', 'Release Date': 'March 2025' },
      Body: { Dimensions: '161.4 x 75.3 x 9.2 mm', Weight: '224 g', Build: 'Glass front (Shield Glass), eco-leather or ceramic back, Titanium frame', SIM: 'Dual SIM (Nano-SIM, dual stand-by)', Colors: 'Black, White, Silver Chrome' },
      Display: { Type: 'LTPO AMOLED, 68B colors, 120Hz, Dolby Vision, HDR10+, 3200 nits', Size: '6.73 inches (~89.8% screen-to-body ratio)', Resolution: '1440 x 3200 pixels (~522 ppi density)', Protection: 'Xiaomi Shield Glass', 'Refresh Rate': '1-120Hz', Brightness: '3200 nits peak' },
      Platform: { OS: 'Android 15, HyperOS 2', Chipset: 'Snapdragon 8 Elite (3 nm)', CPU: 'Octa-core (2x4.32 GHz + 6x3.53 GHz)', GPU: 'Adreno 830' },
      Memory: { RAM: '16GB LPDDR5X', 'Internal Storage': '512GB / 1TB UFS 4.0', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Leica Quad: 50MP 1-inch + 200MP periscope + 50MP telephoto + 50MP ultrawide', 'Main sensor': '50 MP, f/1.63-f/4.0 variable aperture, 23mm, 1.0"-type, Laser AF, OIS', Ultrawide: '50 MP, f/1.8, 12mm, 122˚', Telephoto: '200 MP, f/2.6, 100mm periscope 4.3x zoom + 50MP 3.2x zoom', Features: 'Leica Summilux lenses, 8K video, Ultra RAW', Video: '8K@30fps, 4K@24/30/60/120fps with Dolby Vision' },
      'Selfie Camera': { Camera: '32 MP, f/2.0, 22mm (wide)', Features: 'HDR, panorama', Video: '4K@30/60fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers (Dolby Atmos)', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 7', Bluetooth: '5.4', GPS: 'Dual-band A-GPS, GLONASS, BDS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 3.2 Gen 2', Infrared: 'Yes' },
      Features: { Sensors: 'Ultrasonic under-display fingerprint, gyro, compass, color spectrum', Fingerprint: 'Under display ultrasonic', 'Face Unlock': 'Yes', 'Other Features': 'Satellite communication support, IP68 water resistant' },
      Battery: { Capacity: '6000 mAh Silicon-Carbon', Type: 'Li-Po', Charging: '90W wired, 100% in 35 min', 'Wireless Charging': '80W wireless, 100% in 45 min', 'Reverse Charging': '10W reverse wireless' },
      Price: { Pakistan: 'PKR 319,999', USA: 'USD 1,099', UAE: 'AED 3,999', India: 'INR 99,999', UK: 'GBP 1,099' }
    }
  },
  // 6. Vivo X200 Pro
  {
    brand: 'vivo',
    name: 'Vivo X200 Pro',
    slug: 'vivo-x200-pro',
    release_date: 'October 2024',
    status: 'Available',
    price: 279999,
    featured: 1,
    popular: 1,
    short_desc: 'Zeiss optics with 200MP APO telephoto sensor, MediaTek Dimensity 9400, 6000mAh BlueVolt battery, and 90W charging.',
    prices: { Pakistan: 'PKR 279,999', USA: 'USD 999', UAE: 'AED 3,699', India: 'INR 94,999', UK: 'GBP 949' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1, 2, 3, 5, 7, 8, 20, 28, 38, 40, 41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, October', Status: 'Available. Released October 2024', 'Release Date': 'October 2024' },
      Body: { Dimensions: '162.4 x 76.0 x 8.2 mm', Weight: '223 g', Build: 'Glass front, glass back, aluminum frame', SIM: 'Dual SIM (Nano-SIM)', Colors: 'Titanium Grey, Carbon Black, Moonlight White, Sapphire Blue' },
      Display: { Type: 'LTPO AMOLED, 1B colors, 120Hz, HDR10+, Dolby Vision, 4500 nits peak', Size: '6.78 inches (~89.8% screen-to-body ratio)', Resolution: '1260 x 2800 pixels (~453 ppi density)', Protection: 'Armor Glass', 'Refresh Rate': '1-120Hz', Brightness: '4500 nits peak' },
      Platform: { OS: 'Android 15, OriginOS 5 / Funtouch 15', Chipset: 'MediaTek Dimensity 9400 (3 nm)', CPU: 'Octa-core (1x3.63 GHz Cortex-X925 + 3x3.3 GHz + 4x2.4 GHz)', GPU: 'Immortalis-G925' },
      Memory: { RAM: '16GB LPDDR5X', 'Internal Storage': '512GB / 1TB UFS 4.0', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Zeiss Triple: 50MP Sony LYT-818 + 200MP APO periscope + 50MP ultrawide', 'Main sensor': '50 MP, f/1.57, 23mm, 1/1.28", PDAF, OIS', Ultrawide: '50 MP, f/2.0, 15mm, 119˚', Telephoto: '200 MP, f/2.67, 85mm Zeiss APO periscope, 3.7x optical zoom, OIS', Features: 'Zeiss T* lens coating, Zeiss multifocal portraits, V3+ imaging chip', Video: '4K@60/120fps HDR, 8K@30fps' },
      'Selfie Camera': { Camera: '32 MP, f/2.0, 20mm (ultrawide)', Features: 'HDR', Video: '4K@60fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 7', Bluetooth: '5.4', GPS: 'Dual-band GPS, GLONASS, BDS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 3.2 Gen 1', Infrared: 'Yes' },
      Features: { Sensors: 'Ultrasonic under-display fingerprint, gyro, compass, laser focus', Fingerprint: 'Under display ultrasonic', 'Face Unlock': 'Yes', 'Other Features': 'IP68/IP69 dust and high-temperature water resistant' },
      Battery: { Capacity: '6000 mAh Silicon-Anode', Type: 'Li-Ion', Charging: '90W wired FlashCharge', 'Wireless Charging': '30W wireless', 'Reverse Charging': 'Reverse wired charging' },
      Price: { Pakistan: 'PKR 279,999', USA: 'USD 999', UAE: 'AED 3,699', India: 'INR 94,999', UK: 'GBP 949' }
    }
  },
  // 7. Google Pixel 9 Pro XL
  {
    brand: 'google',
    name: 'Google Pixel 9 Pro XL',
    slug: 'google-pixel-9-pro-xl',
    release_date: 'August 2024',
    status: 'Available',
    price: 299999,
    featured: 1,
    popular: 1,
    short_desc: 'Google flagship powered by Tensor G4 with 16GB RAM, Gemini Nano multimodal AI, and 50MP triple pro camera system.',
    prices: { Pakistan: 'PKR 299,999', USA: 'USD 1,099', UAE: 'AED 3,999', India: 'INR 124,999', UK: 'GBP 1,099' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Full global LTE bands', '5G': 'Sub6 / mmWave', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, August', Status: 'Available. Released August 2024', 'Release Date': 'August 2024' },
      Body: { Dimensions: '162.8 x 76.6 x 8.5 mm', Weight: '221 g', Build: 'Gorilla Glass Victus 2 front and back, polished aluminum frame', SIM: 'Nano-SIM and eSIM', Colors: 'Obsidian, Porcelain, Hazel, Rose Quartz' },
      Display: { Type: 'Super Actua LTPO OLED, 120Hz, HDR10+, 3000 nits peak', Size: '6.8 inches (~88.0% screen-to-body ratio)', Resolution: '1344 x 2992 pixels (~486 ppi density)', Protection: 'Gorilla Glass Victus 2', 'Refresh Rate': '1-120Hz', Brightness: '3000 nits peak' },
      Platform: { OS: 'Android 15, upgradable with 7 years of major OS updates', Chipset: 'Google Tensor G4 (4 nm)', CPU: 'Octa-core (1x3.1 GHz Cortex-X4 + 3x2.6 GHz + 4x1.92 GHz)', GPU: 'Mali-G715 MC7' },
      Memory: { RAM: '16GB LPDDR5X', 'Internal Storage': '128GB / 256GB / 512GB / 1TB UFS 3.1', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Triple: 50MP + 48MP + 48MP', 'Main sensor': '50 MP, f/1.7, 25mm, 1/1.31", dual pixel PDAF, OIS', Ultrawide: '48 MP, f/1.7, 123˚, dual pixel PDAF, macro', Telephoto: '48 MP, f/2.8, 113mm (periscope), 5x optical zoom, OIS', Features: 'Best Take, Add Me, Magic Editor, Zoom Enhance 30x', Video: '8K@30fps (via Video Boost), 4K@24/30/60fps' },
      'Selfie Camera': { Camera: '42 MP, f/2.2, 17mm (ultrawide), PDAF', Features: 'Auto-HDR, panorama', Video: '4K@30/60fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 7', Bluetooth: '5.3', GPS: 'Dual-band GPS, GLONASS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 3.2', Infrared: 'No' },
      Features: { Sensors: 'Ultrasonic under-display fingerprint, gyro, compass, thermometer', Fingerprint: 'Under display ultrasonic', 'Face Unlock': 'Yes (Class 3 biometric Face Unlock)', 'Other Features': 'Satellite SOS, IP68 water resistance, Gemini Live assistant' },
      Battery: { Capacity: '5060 mAh', Type: 'Li-Ion', Charging: '37W wired, 70% in 30 min', 'Wireless Charging': '23W wireless with Pixel Stand', 'Reverse Charging': 'Reverse wireless charging' },
      Price: { Pakistan: 'PKR 299,999', USA: 'USD 1,099', UAE: 'AED 3,999', India: 'INR 124,999', UK: 'GBP 1,099' }
    }
  },
  // 8. OnePlus 13
  {
    brand: 'oneplus',
    name: 'OnePlus 13',
    slug: 'oneplus-13',
    release_date: 'November 2024',
    status: 'Available',
    price: 249999,
    featured: 1,
    popular: 1,
    short_desc: 'Snapdragon 8 Elite powerhouse with 24GB RAM option, 6000mAh Glacier Battery, 100W SuperVOOC, and Hasselblad camera.',
    prices: { Pakistan: 'PKR 249,999', USA: 'USD 899', UAE: 'AED 3,299', India: 'INR 69,999', UK: 'GBP 849' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 1900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, October', Status: 'Available. Released 2024, November', 'Release Date': 'November 2024' },
      Body: { Dimensions: '162.9 x 76.5 x 8.5 mm', Weight: '213 g', Build: 'Glass front (Crystal Shield), glass or leather back, aluminum frame', SIM: 'Dual SIM', Colors: 'Midnight Black, Arctic Dawn, Blue Hour' },
      Display: { Type: 'LTPO AMOLED, 1B colors, 120Hz, Dolby Vision, HDR10+, 4500 nits', Size: '6.82 inches (~90.7% screen-to-body ratio)', Resolution: '1440 x 3168 pixels (~510 ppi density)', Protection: 'Crystal Shield ceramic glass', 'Refresh Rate': '1-120Hz', Brightness: '4500 nits peak' },
      Platform: { OS: 'Android 15, OxygenOS 15', Chipset: 'Snapdragon 8 Elite (3 nm)', CPU: 'Octa-core (2x4.32 GHz + 6x3.53 GHz)', GPU: 'Adreno 830' },
      Memory: { RAM: '12GB / 16GB / 24GB LPDDR5X', 'Internal Storage': '256GB / 512GB / 1TB UFS 4.0', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Hasselblad Triple: 50MP Sony LYT-808 + 50MP 3x periscope + 50MP ultrawide', 'Main sensor': '50 MP, f/1.6, 23mm, multi-directional PDAF, OIS', Ultrawide: '50 MP, f/2.0, 15mm, 120˚', Telephoto: '50 MP, f/2.6, 73mm periscope, 3x optical zoom, OIS', Features: 'Hasselblad Color Calibration, HDR, Master Mode', Video: '8K@30fps, 4K@30/60fps Dolby Vision' },
      'Selfie Camera': { Camera: '32 MP, f/2.4, 21mm (wide)', Features: 'Auto-HDR', Video: '4K@30/60fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers with spatial audio', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 7', Bluetooth: '5.4', GPS: 'Dual-band GPS, GLONASS, BDS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 3.2 Gen 1', Infrared: 'Yes' },
      Features: { Sensors: 'Ultrasonic under-display fingerprint, gyro, compass, color spectrum', Fingerprint: 'Under display ultrasonic', 'Face Unlock': 'Yes', 'Other Features': 'Alert slider, IP68/IP69 water resistance, wet-hand touch 2.0' },
      Battery: { Capacity: '6000 mAh Glacier Silicon-Carbon', Type: 'Li-Po', Charging: '100W wired, 100% in 36 min', 'Wireless Charging': '50W wireless', 'Reverse Charging': 'Magnetic ecosystem support' },
      Price: { Pakistan: 'PKR 249,999', USA: 'USD 899', UAE: 'AED 3,299', India: 'INR 69,999', UK: 'GBP 849' }
    }
  },
  // 9. Oppo Find X8 Pro
  {
    brand: 'oppo',
    name: 'Oppo Find X8 Pro',
    slug: 'oppo-find-x8-pro',
    release_date: 'November 2024',
    status: 'Available',
    price: 269999,
    featured: 0,
    popular: 1,
    short_desc: 'Dual periscope telephoto lenses with Hasselblad imaging, Dimensity 9400, Quick Button, and 5910mAh silicon battery.',
    prices: { Pakistan: 'PKR 269,999', USA: 'USD 949', UAE: 'AED 3,599', India: 'INR 89,999', UK: 'GBP 899' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, October', Status: 'Available. Released 2024, November', 'Release Date': 'November 2024' },
      Body: { Dimensions: '162.3 x 76.7 x 8.2 mm', Weight: '215 g', Build: 'Gorilla Glass 7i front, glass back, aluminum frame', SIM: 'Dual SIM', Colors: 'Space Black, Pearl White' },
      Display: { Type: 'LTPO AMOLED, 1B colors, 120Hz, Dolby Vision, 4500 nits peak', Size: '6.78 inches (~89.8% screen-to-body ratio)', Resolution: '1264 x 2780 pixels (~450 ppi density)', Protection: 'Corning Gorilla Glass 7i', 'Refresh Rate': '1-120Hz', Brightness: '4500 nits' },
      Platform: { OS: 'Android 15, ColorOS 15', Chipset: 'MediaTek Dimensity 9400 (3 nm)', CPU: 'Octa-core 3.63 GHz', GPU: 'Immortalis-G925' },
      Memory: { RAM: '16GB LPDDR5X', 'Internal Storage': '512GB UFS 4.0', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Quad: 50MP + 50MP (3x periscope) + 50MP (6x periscope) + 50MP ultrawide', 'Main sensor': '50 MP, f/1.6, 23mm, PDAF, OIS', Ultrawide: '50 MP, f/2.0, 15mm, 120˚', Telephoto: '50 MP (3x) + 50 MP (6x periscope), OIS', Features: 'Hasselblad Color, Lightning Snap', Video: '4K@30/60fps Dolby Vision' },
      'Selfie Camera': { Camera: '32 MP, f/2.4, 21mm', Features: 'Panorama, HDR', Video: '4K@60fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 7', Bluetooth: '5.4', GPS: 'Dual-band GPS, BDS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 3.1', Infrared: 'Yes' },
      Features: { Sensors: 'Optical under-display fingerprint, Quick button', Fingerprint: 'Under display optical', 'Face Unlock': 'Yes', 'Other Features': 'IP68/IP69 water and dust resistance' },
      Battery: { Capacity: '5910 mAh Glacier battery', Type: 'Li-Po', Charging: '80W wired SuperVOOC', 'Wireless Charging': '50W wireless AirVOOC', 'Reverse Charging': '10W reverse wireless' },
      Price: { Pakistan: 'PKR 269,999', USA: 'USD 949', UAE: 'AED 3,599', India: 'INR 89,999', UK: 'GBP 899' }
    }
  },
  // 10. Realme GT 7 Pro
  {
    brand: 'realme',
    name: 'Realme GT 7 Pro',
    slug: 'realme-gt-7-pro',
    release_date: 'November 2024',
    status: 'Available',
    price: 189999,
    featured: 0,
    popular: 1,
    short_desc: 'Affordable flagship powerhouse featuring Snapdragon 8 Elite, massive 6500mAh Titan battery, and 120W Ultra Charge.',
    prices: { Pakistan: 'PKR 189,999', USA: 'USD 649', UAE: 'AED 2,399', India: 'INR 59,999', UK: 'GBP 599' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, November', Status: 'Available. Released November 2024', 'Release Date': 'November 2024' },
      Body: { Dimensions: '162.5 x 76.9 x 8.6 mm', Weight: '223 g', Build: 'Glass front, glass back, aviation aluminum frame', SIM: 'Dual SIM', Colors: 'Mars Orange, Galaxy Grey, White' },
      Display: { Type: 'Eco2 OLED Plus, 1B colors, 120Hz, HDR10+, Dolby Vision, 6000 nits peak', Size: '6.78 inches (~89.5% screen-to-body ratio)', Resolution: '1264 x 2780 pixels (~450 ppi density)', Protection: 'Armored Glass', 'Refresh Rate': '1-120Hz', Brightness: '6000 nits peak' },
      Platform: { OS: 'Android 15, Realme UI 6.0', Chipset: 'Snapdragon 8 Elite (3 nm)', CPU: 'Octa-core (2x4.32 GHz + 6x3.53 GHz)', GPU: 'Adreno 830' },
      Memory: { RAM: '12GB / 16GB LPDDR5X', 'Internal Storage': '256GB / 512GB UFS 4.0', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Triple: 50MP Sony IMX906 + 50MP 3x periscope + 8MP ultrawide', 'Main sensor': '50 MP, f/1.8, 24mm, PDAF, OIS', Ultrawide: '8 MP, f/2.2, 112˚', Telephoto: '50 MP, f/2.65, 73mm periscope, 3x optical zoom, OIS', Features: 'Underwater camera mode, AI Motion Deblur', Video: '8K@24fps, 4K@30/60fps' },
      'Selfie Camera': { Camera: '16 MP, f/2.45, 25mm', Features: 'HDR, panorama', Video: '4K@30fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers with Hi-Res audio', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 7', Bluetooth: '5.4', GPS: 'Dual-frequency GPS, GLONASS, BDS', NFC: 'Yes', USB: 'USB Type-C 2.0', Infrared: 'Yes' },
      Features: { Sensors: 'Ultrasonic under-display fingerprint, gyro, compass', Fingerprint: 'Under display ultrasonic', 'Face Unlock': 'Yes', 'Other Features': 'IP68/IP69 water & dust resistance, underwater photography' },
      Battery: { Capacity: '6500 mAh Titan battery', Type: 'Silicon-Carbon', Charging: '120W wired, 50% in 14 min, 100% in 37 min', 'Wireless Charging': 'No', 'Reverse Charging': 'Reverse wired charging' },
      Price: { Pakistan: 'PKR 189,999', USA: 'USD 649', UAE: 'AED 2,399', India: 'INR 59,999', UK: 'GBP 599' }
    }
  },
  // 11. Tecno Camon 30 Premier
  {
    brand: 'tecno',
    name: 'Tecno Camon 30 Premier 5G',
    slug: 'tecno-camon-30-premier-5g',
    release_date: 'May 2024',
    status: 'Available',
    price: 139999,
    featured: 0,
    popular: 0,
    short_desc: 'Imaging-centric mid-ranger with quad 50MP cameras, Sony CXD5622GG ISP, Dimensity 8200 Ultimate, and 1.5K LTPO AMOLED.',
    prices: { Pakistan: 'PKR 139,999', USA: 'USD 449', UAE: 'AED 1,599', India: 'INR 39,999', UK: 'GBP 399' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, February', Status: 'Available. Released 2024, May', 'Release Date': 'May 2024' },
      Body: { Dimensions: '162.7 x 76.2 x 7.9 mm', Weight: '210 g', Build: 'Glass front (Gorilla Glass 5), faux leather back, metal frame', SIM: 'Dual SIM', Colors: 'Alps Snowy Silver, Hawaii Lava Black' },
      Display: { Type: 'LTPO AMOLED, 1B colors, 120Hz, 1400 nits peak', Size: '6.77 inches (~89.3% screen-to-body ratio)', Resolution: '1264 x 2780 pixels (~451 ppi density)', Protection: 'Gorilla Glass 5', 'Refresh Rate': '1-120Hz', Brightness: '1400 nits peak' },
      Platform: { OS: 'Android 14, HIOS 14', Chipset: 'MediaTek Dimensity 8200 Ultimate (4 nm)', CPU: 'Octa-core (1x3.1 GHz + 3x3.0 GHz + 4x2.0 GHz)', GPU: 'Mali-G610 MC6' },
      Memory: { RAM: '12GB + 12GB Extended', 'Internal Storage': '512GB', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Triple: 50MP Sony IMX890 + 50MP 3x periscope + 50MP ultrawide', 'Main sensor': '50 MP, f/1.88, 23mm, PDAF, OIS', Ultrawide: '50 MP, f/2.2, 14mm, 114˚', Telephoto: '50 MP, f/2.2, 70mm periscope, 3x optical zoom', Features: 'Polaroid style flash, 4K 30fps HDR video, dual imaging chip', Video: '4K@30/60fps HDR' },
      'Selfie Camera': { Camera: '50 MP, f/2.45, PDAF with eye tracking', Features: 'Dual color LED flash', Video: '4K@60fps' },
      Sound: { Loudspeaker: 'Yes, dual stereo speakers with Dolby Atmos', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 6', Bluetooth: '5.3', GPS: 'GPS, GLONASS, BDS', NFC: 'Yes', USB: 'USB Type-C 2.0', Infrared: 'Yes' },
      Features: { Sensors: 'Under-display optical fingerprint, gyro, compass, action dot notification', Fingerprint: 'Under display optical', 'Face Unlock': 'Yes', 'Other Features': 'Action dot breathing light, wet finger touch' },
      Battery: { Capacity: '5000 mAh', Type: 'Li-Po', Charging: '70W wired, 100% in 45 min', 'Wireless Charging': 'No', 'Reverse Charging': '10W reverse wired' },
      Price: { Pakistan: 'PKR 139,999', USA: 'USD 449', UAE: 'AED 1,599', India: 'INR 39,999', UK: 'GBP 399' }
    }
  },
  // 12. Infinix Zero Ultra 5G
  {
    brand: 'infinix',
    name: 'Infinix Zero Ultra 5G',
    slug: 'infinix-zero-ultra-5g',
    release_date: 'October 2024',
    status: 'Available',
    price: 114999,
    featured: 0,
    popular: 0,
    short_desc: 'Thunderbolt 180W charging with 200MP OIS camera, 3D Curved 120Hz AMOLED display, and Dimensity 920 chipset.',
    prices: { Pakistan: 'PKR 114,999', USA: 'USD 389', UAE: 'AED 1,399', India: 'INR 32,999', UK: 'GBP 329' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1, 2, 3, 4, 5, 7, 8, 20, 28, 38, 40, 41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, October', Status: 'Available', 'Release Date': 'October 2024' },
      Body: { Dimensions: '165.5 x 74.5 x 8.8 mm', Weight: '213 g', Build: 'Glass front (curved), star trail textured glass back', SIM: 'Dual SIM', Colors: 'Coslight Silver, Genesis Noir' },
      Display: { Type: 'AMOLED, 120Hz, 900 nits peak', Size: '6.8 inches 3D Waterfall Curved (~90.7% screen-to-body ratio)', Resolution: '1080 x 2400 pixels (~387 ppi density)', Protection: 'Corning Gorilla Glass 3', 'Refresh Rate': '120Hz', Brightness: '900 nits' },
      Platform: { OS: 'Android 14, XOS 14', Chipset: 'MediaTek Dimensity 920 (6 nm)', CPU: 'Octa-core (2x2.5 GHz Cortex-A78 + 6x2.0 GHz Cortex-A55)', GPU: 'Mali-G68 MC4' },
      Memory: { RAM: '8GB + 8GB Virtual RAM', 'Internal Storage': '256GB UFS 2.2', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Triple: 200MP + 13MP ultrawide + 2MP depth', 'Main sensor': '200 MP, f/2.0, 1/1.22", Dual Pixel PDAF, OIS', Ultrawide: '13 MP, f/2.4, AF', Telephoto: '2 MP depth sensor', Features: 'Dual-LED flash, Super Night mode, HDR', Video: '4K@30fps, 1080p@30/60fps' },
      'Selfie Camera': { Camera: '32 MP, f/2.0, Dual-LED flash', Features: 'Dual-LED flash, HDR', Video: '1080p@30fps' },
      Sound: { Loudspeaker: 'Yes, dual stereo speakers', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 6', Bluetooth: '5.2', GPS: 'GPS', NFC: 'Yes', USB: 'USB Type-C 2.0', Infrared: 'No' },
      Features: { Sensors: 'Under-display optical fingerprint, gyro, proximity, compass', Fingerprint: 'Under display optical', 'Face Unlock': 'Yes', 'Other Features': 'TUV Rheinland safe fast-charge certification' },
      Battery: { Capacity: '4500 mAh', Type: 'Dual-cell Li-Po', Charging: '180W Thunder Charge, 100% in 12 min', 'Wireless Charging': 'No', 'Reverse Charging': 'Reverse wired' },
      Price: { Pakistan: 'PKR 114,999', USA: 'USD 389', UAE: 'AED 1,399', India: 'INR 32,999', UK: 'GBP 329' }
    }
  },
  // 13. Motorola Edge 50 Ultra
  {
    brand: 'motorola',
    name: 'Motorola Edge 50 Ultra',
    slug: 'motorola-edge-50-ultra',
    release_date: 'May 2024',
    status: 'Available',
    price: 219999,
    featured: 0,
    popular: 0,
    short_desc: 'Real wood & vegan leather finishes with Pantone validated 144Hz pOLED, Snapdragon 8s Gen 3, and 125W TurboPower.',
    prices: { Pakistan: 'PKR 219,999', USA: 'USD 799', UAE: 'AED 2,899', India: 'INR 59,999', UK: 'GBP 749' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, April', Status: 'Available. Released May 2024', 'Release Date': 'May 2024' },
      Body: { Dimensions: '161.1 x 72.4 x 8.6 mm', Weight: '197 g', Build: 'Gorilla Glass Victus front, natural wood or vegan leather back, aluminum frame', SIM: 'Nano-SIM and eSIM', Colors: 'Nordic Wood, Peach Fuzz, Forest Grey' },
      Display: { Type: 'Super HD pOLED, 1B colors, 144Hz, HDR10+, 2500 nits peak', Size: '6.7 inches (~92.1% screen-to-body ratio)', Resolution: '1220 x 2712 pixels (~446 ppi density)', Protection: 'Gorilla Glass Victus', 'Refresh Rate': '144Hz', Brightness: '2500 nits' },
      Platform: { OS: 'Android 14, Hello UI', Chipset: 'Qualcomm Snapdragon 8s Gen 3 (4 nm)', CPU: 'Octa-core (1x3.0 GHz Cortex-X4 + 4x2.8 GHz + 3x2.0 GHz)', GPU: 'Adreno 735' },
      Memory: { RAM: '16GB LPDDR5X', 'Internal Storage': '512GB / 1TB UFS 4.0', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Triple: 50MP + 64MP 3x periscope + 50MP ultrawide', 'Main sensor': '50 MP, f/1.6, 1/1.3", multi-directional PDAF, Laser AF, OIS', Ultrawide: '50 MP, f/2.0, 12mm, 122˚, AF macro', Telephoto: '64 MP, f/2.4, 72mm periscope, 3x optical zoom, OIS', Features: 'Pantone validated color and skin tones, Moto AI photo engine', Video: '4K@30/60fps, 1080p@30/60/120/240fps' },
      'Selfie Camera': { Camera: '50 MP, f/1.9, 21mm, PDAF', Features: 'Auto-HDR', Video: '4K@30/60fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers with Dolby Atmos tuning', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 7', Bluetooth: '5.4', GPS: 'GPS, GLONASS, BDS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 3.1 Gen 2, DisplayPort 1.4', Infrared: 'No' },
      Features: { Sensors: 'Optical under-display fingerprint, gyro, compass, UWB support', Fingerprint: 'Under display optical', 'Face Unlock': 'Yes', 'Other Features': 'IP68 water and dust resistance, Ready For PC desktop support' },
      Battery: { Capacity: '4500 mAh', Type: 'Li-Ion', Charging: '125W TurboPower wired, 100% in 18 min', 'Wireless Charging': '50W wireless', 'Reverse Charging': '10W reverse wireless' },
      Price: { Pakistan: 'PKR 219,999', USA: 'USD 799', UAE: 'AED 2,899', India: 'INR 59,999', UK: 'GBP 749' }
    }
  },
  // 14. Huawei Pura 70 Ultra
  {
    brand: 'huawei',
    name: 'Huawei Pura 70 Ultra',
    slug: 'huawei-pura-70-ultra',
    release_date: 'April 2024',
    status: 'Available',
    price: 339999,
    featured: 0,
    popular: 0,
    short_desc: 'Retractable pop-out 1-inch camera sensor, Kirin 9010 processor, Kunlun Crystal Glass, and XMAGE ultra-speed snapshot.',
    prices: { Pakistan: 'PKR 339,999', USA: 'USD 1,299', UAE: 'AED 4,799', India: 'INR 119,999', UK: 'GBP 1,199' },
    specs: {
      Network: { Technology: 'GSM / CDMA / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, April', Status: 'Available. Released April 2024', 'Release Date': 'April 2024' },
      Body: { Dimensions: '162.6 x 75.1 x 8.4 mm', Weight: '226 g', Build: 'Crystal Kunlun glass front, faux leather back, aluminum frame', SIM: 'Dual SIM', Colors: 'Chanson Green, Mocha Brown, Starburst White, Star Black' },
      Display: { Type: 'LTPO OLED, 1B colors, 120Hz, HDR, 2500 nits peak', Size: '6.8 inches (~89.3% screen-to-body ratio)', Resolution: '1260 x 2844 pixels (~460 ppi density)', Protection: 'Basalt-tempered Kunlun Glass', 'Refresh Rate': '1-120Hz', Brightness: '2500 nits' },
      Platform: { OS: 'EMUI 14.2 / HarmonyOS 4.2', Chipset: 'Kirin 9010 (7 nm)', CPU: '12-core architecture', GPU: 'Maleoon 910' },
      Memory: { RAM: '16GB', 'Internal Storage': '512GB / 1TB', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Retractable Triple: 50MP 1-inch mechanical pop-out + 50MP 3.5x macro periscope + 40MP ultrawide', 'Main sensor': '50 MP, f/1.6-4.0 variable aperture, 22.5mm retractable, Sensor-shift OIS', Ultrawide: '40 MP, f/2.2, 13mm', Telephoto: '50 MP, f/2.1, 90mm periscope, 3.5x optical zoom, 5cm macro OIS', Features: 'XMAGE imaging engine, 300km/h high-speed snapshot', Video: '4K@30/60fps, 1080p@30/60/120/480fps' },
      'Selfie Camera': { Camera: '13 MP, f/2.4 (ultrawide), AF', Features: 'HDR, panorama', Video: '4K@30/60fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers with Huawei Histen', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 6', Bluetooth: '5.2', GPS: 'Dual-band GPS, GLONASS, BDS, NavIC', NFC: 'Yes', USB: 'USB Type-C 3.1 Gen 1, DisplayPort', Infrared: 'Yes' },
      Features: { Sensors: 'Optical under-display fingerprint, gyro, compass, color spectrum', Fingerprint: 'Under display optical', 'Face Unlock': 'Yes', 'Other Features': 'BDS Satellite messaging & calls, IP68 water resistance (2m up to 30 min)' },
      Battery: { Capacity: '5200 mAh', Type: 'Li-Po', Charging: '100W wired Huawei SuperCharge', 'Wireless Charging': '80W wireless SuperCharge', 'Reverse Charging': '20W reverse wireless' },
      Price: { Pakistan: 'PKR 339,999', USA: 'USD 1,299', UAE: 'AED 4,799', India: 'INR 119,999', UK: 'GBP 1,199' }
    }
  },
  // 15. Sony Xperia 1 VI
  {
    brand: 'sony',
    name: 'Sony Xperia 1 VI',
    slug: 'sony-xperia-1-vi',
    release_date: 'June 2024',
    status: 'Available',
    price: 329999,
    featured: 0,
    popular: 0,
    short_desc: 'Cinematic creator flagship with continuous optical telephoto zoom (85mm-170mm), 3.5mm audio jack, and Snapdragon 8 Gen 3.',
    prices: { Pakistan: 'PKR 329,999', USA: 'USD 1,249', UAE: 'AED 4,599', India: 'INR 114,999', UK: 'GBP 1,199' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, May', Status: 'Available. Released June 2024', 'Release Date': 'June 2024' },
      Body: { Dimensions: '162 x 74 x 8.2 mm', Weight: '192 g', Build: 'Gorilla Glass Victus 2 front, tactile micro-dot glass back, aluminum frame', SIM: 'Nano-SIM and eSIM', Colors: 'Black, Platinum Silver, Khaki Green' },
      Display: { Type: 'LTPO OLED, 1B colors, 120Hz, HDR BT.2020, 1500 nits peak', Size: '6.5 inches 19.5:9 (~86.5% screen-to-body ratio)', Resolution: '1080 x 2340 pixels (~396 ppi density)', Protection: 'Gorilla Glass Victus 2', 'Refresh Rate': '1-120Hz', Brightness: '1500 nits' },
      Platform: { OS: 'Android 14, upgradable to 15', Chipset: 'Snapdragon 8 Gen 3 (4 nm)', CPU: 'Octa-core 3.3 GHz Cortex-X4', GPU: 'Adreno 750' },
      Memory: { RAM: '12GB LPDDR5X', 'Internal Storage': '256GB / 512GB UFS 4.0', 'Card Slot': 'Yes, microSDXC (uses shared SIM slot)' },
      'Main Camera': { 'Camera configuration': 'Zeiss T* Triple: 52MP (48MP effective) + 12MP true optical zoom + 12MP ultrawide', 'Main sensor': '48 MP, f/1.9, 24mm, 1/1.35", Dual Pixel PDAF, OIS', Ultrawide: '12 MP, f/2.2, 16mm, Dual Pixel PDAF', Telephoto: '12 MP, f/2.3-f/3.5, 85-170mm continuous optical zoom (3.5x-7.1x), OIS', Features: 'Zeiss T* coating, Real-time Eye AF for humans and animals, 4K 120fps video', Video: '4K@24/25/30/60/120fps HDR, 5-axis gyro-EIS and OIS' },
      'Selfie Camera': { Camera: '12 MP, f/2.0, 24mm', Features: 'HDR', Video: '4K@30/60fps' },
      Sound: { Loudspeaker: 'Yes, full-stage front stereo speakers', '3.5mm Jack': 'Yes (Hi-Res Audio, 3.5mm headphone jack with dedicated amp)' },
      Connectivity: { WLAN: 'Wi-Fi 7', Bluetooth: '5.4, aptX HD, LDAC', GPS: 'Dual-band A-GPS, GLONASS, BDS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 3.2 Gen 1, DisplayPort', Infrared: 'No' },
      Features: { Sensors: 'Side-mounted fingerprint, physical two-stage shutter button, gyro, barometer', Fingerprint: 'Side-mounted', 'Face Unlock': 'No', 'Other Features': 'Dedicated shutter button, IP65/IP68 water resistant' },
      Battery: { Capacity: '5000 mAh', Type: 'Li-Ion', Charging: '30W wired, 50% in 30 min, USB PD3.0', 'Wireless Charging': '15W Qi wireless', 'Reverse Charging': 'Reverse wireless sharing' },
      Price: { Pakistan: 'PKR 329,999', USA: 'USD 1,249', UAE: 'AED 4,599', India: 'INR 114,999', UK: 'GBP 1,199' }
    }
  },
  // 16. Honor Magic 7 Pro
  {
    brand: 'honor',
    name: 'Honor Magic 7 Pro',
    slug: 'honor-magic-7-pro',
    release_date: 'November 2024',
    status: 'Available',
    price: 289999,
    featured: 0,
    popular: 1,
    short_desc: 'Snapdragon 8 Elite flagship with 200MP periscope zoom, 5850mAh Qinghai Lake silicon-carbon battery, and 3D Face Unlock.',
    prices: { Pakistan: 'PKR 289,999', USA: 'USD 999', UAE: 'AED 3,799', India: 'INR 92,999', UK: 'GBP 949' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, October', Status: 'Available. Released November 2024', 'Release Date': 'November 2024' },
      Body: { Dimensions: '162.7 x 77.1 x 8.8 mm', Weight: '223 g', Build: 'Rhino Glass front, glass back, aluminum alloy frame', SIM: 'Dual SIM', Colors: 'Moon Shadow Grey, Breeze Blue, Snow White, Velvet Black' },
      Display: { Type: 'LTPO OLED, 1B colors, 120Hz, Dolby Vision, 5000 nits peak, 4320Hz PWM dimming', Size: '6.8 inches (~89.9% screen-to-body ratio)', Resolution: '1280 x 2800 pixels (~453 ppi density)', Protection: 'Giant Rhino Glass', 'Refresh Rate': '1-120Hz', Brightness: '5000 nits peak' },
      Platform: { OS: 'Android 15, MagicOS 9.0 with AI Agent', Chipset: 'Snapdragon 8 Elite (3 nm)', CPU: 'Octa-core 4.32 GHz Oryon', GPU: 'Adreno 830' },
      Memory: { RAM: '16GB LPDDR5X', 'Internal Storage': '512GB / 1TB UFS 4.0', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Triple: 50MP OmniVision variable aperture + 200MP 3x periscope + 50MP ultrawide', 'Main sensor': '50 MP, f/1.4-f/2.0 variable, 1/1.3", PDAF, OIS', Ultrawide: '50 MP, f/2.0, 12mm, 122˚, AF', Telephoto: '200 MP, f/2.6, 60mm periscope, 3x optical, 100x digital, OIS', Features: 'Honor AI Eagle Eye camera, 4K HDR movie mode', Video: '4K@30/60fps 10-bit Log, gyro-EIS' },
      'Selfie Camera': { Camera: '50 MP, f/2.0 + 3D Depth Camera', Features: '3D biometric sensing, HDR', Video: '4K@60fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers with spatial audio', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 7', Bluetooth: '5.4', GPS: 'Dual-band GPS, BDS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 3.2 Gen 1', Infrared: 'Yes' },
      Features: { Sensors: 'Ultrasonic under-display fingerprint, 3D Face ID, gyro, compass', Fingerprint: 'Under display ultrasonic', 'Face Unlock': 'Yes (3D structured light hardware)', 'Other Features': 'Satellite calling & dual SMS, IP68/IP69 water resistance' },
      Battery: { Capacity: '5850 mAh Qinghai Lake Silicon-Carbon', Type: 'Li-Po', Charging: '100W wired SuperCharge', 'Wireless Charging': '80W wireless SuperCharge', 'Reverse Charging': '5W reverse wireless' },
      Price: { Pakistan: 'PKR 289,999', USA: 'USD 999', UAE: 'AED 3,799', India: 'INR 92,999', UK: 'GBP 949' }
    }
  },
  // 17. Samsung Galaxy A56 5G
  {
    brand: 'samsung',
    name: 'Samsung Galaxy A56 5G',
    slug: 'samsung-galaxy-a56-5g',
    release_date: 'March 2025',
    status: 'Upcoming',
    price: 139999,
    featured: 0,
    popular: 1,
    short_desc: 'Popular mid-ranger with Exynos 1580 chip featuring AMD RDNA GPU, 50MP OIS camera, 45W charging, and 6 years of OS upgrades.',
    prices: { Pakistan: 'PKR 139,999', USA: 'USD 449', UAE: 'AED 1,649', India: 'INR 39,999', UK: 'GBP 439' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2025, March', Status: 'Upcoming', 'Release Date': 'March 2025' },
      Body: { Dimensions: '161.7 x 77.4 x 8.1 mm', Weight: '209 g', Build: 'Gorilla Glass Victus+ front and back, metal frame', SIM: 'Nano-SIM and eSIM or Hybrid Dual SIM', Colors: 'Awesome Navy, Awesome Iceblue, Awesome Lilac, Awesome Lemon' },
      Display: { Type: 'Super AMOLED, 120Hz, HDR10+, 1600 nits', Size: '6.6 inches (~86.0% screen-to-body ratio)', Resolution: '1080 x 2340 pixels (~390 ppi density)', Protection: 'Gorilla Glass Victus+', 'Refresh Rate': '120Hz', Brightness: '1600 nits' },
      Platform: { OS: 'Android 15, One UI 7', Chipset: 'Exynos 1580 (4 nm)', CPU: 'Octa-core (1x2.91 GHz + 3x2.6 GHz + 4x1.95 GHz)', GPU: 'Xclipse 540 (AMD RDNA 3)' },
      Memory: { RAM: '8GB / 12GB', 'Internal Storage': '128GB / 256GB', 'Card Slot': 'microSDXC (uses shared SIM slot)' },
      'Main Camera': { 'Camera configuration': 'Triple: 50MP main + 12MP ultrawide + 5MP macro', 'Main sensor': '50 MP, f/1.8, PDAF, OIS', Ultrawide: '12 MP, f/2.2, 123˚', Telephoto: '5 MP, f/2.4 macro', Features: 'LED flash, panorama, HDR', Video: '4K@30fps, 1080p@30/60fps, gyro-EIS' },
      'Selfie Camera': { Camera: '12 MP, f/2.2', Features: 'HDR', Video: '4K@30fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 6', Bluetooth: '5.3', GPS: 'GPS, GALILEO, GLONASS, BDS', NFC: 'Yes', USB: 'USB Type-C 2.0, OTG', Infrared: 'No' },
      Features: { Sensors: 'Optical under-display fingerprint, gyro, compass', Fingerprint: 'Under display optical', 'Face Unlock': 'Yes', 'Other Features': 'Samsung Knox Vault, IP67 dust/water resistant' },
      Battery: { Capacity: '5000 mAh', Type: 'Li-Ion', Charging: '45W wired fast charging', 'Wireless Charging': 'No', 'Reverse Charging': 'No' },
      Price: { Pakistan: 'PKR 139,999', USA: 'USD 449', UAE: 'AED 1,649', India: 'INR 39,999', UK: 'GBP 439' }
    }
  },
  // 18. Apple iPhone 16
  {
    brand: 'apple',
    name: 'Apple iPhone 16',
    slug: 'apple-iphone-16',
    release_date: 'September 2024',
    status: 'Available',
    price: 279999,
    featured: 0,
    popular: 1,
    short_desc: 'Powered by Apple A18 chip with Apple Intelligence, 48MP Fusion dual camera with 2x crop, Action button, and Camera Control.',
    prices: { Pakistan: 'PKR 279,999', USA: 'USD 799', UAE: 'AED 3,399', India: 'INR 79,900', UK: 'GBP 799' },
    specs: {
      Network: { Technology: 'GSM / CDMA / HSPA / EVDO / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'All standard LTE bands', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, September', Status: 'Available. Released September 2024', 'Release Date': 'September 2024' },
      Body: { Dimensions: '147.6 x 71.6 x 7.8 mm', Weight: '170 g', Build: 'Ceramic Shield front, color-infused glass back, aluminum frame', SIM: 'Nano-SIM and eSIM', Colors: 'Black, White, Pink, Teal, Ultramarine' },
      Display: { Type: 'Super Retina XDR OLED, HDR10, Dolby Vision, 2000 nits peak', Size: '6.1 inches (~86.8% screen-to-body ratio)', Resolution: '1179 x 2556 pixels (~460 ppi density)', Protection: 'Ceramic Shield (2024 gen)', 'Refresh Rate': '60Hz', Brightness: '2000 nits peak' },
      Platform: { OS: 'iOS 18, upgradable', Chipset: 'Apple A18 (3 nm)', CPU: 'Hexa-core', GPU: 'Apple GPU (5-core graphics)' },
      Memory: { RAM: '8GB', 'Internal Storage': '128GB / 256GB / 512GB NVMe', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Dual: 48MP Fusion + 12MP ultrawide with macro', 'Main sensor': '48 MP, f/1.6, 26mm, dual pixel PDAF, sensor-shift OIS', Ultrawide: '12 MP, f/2.2, 13mm, 120˚, PDAF', Telephoto: '2x optical quality via 48MP sensor crop', Features: 'Spatial photos, Camera Control, Audio Mix', Video: '4K@24/25/30/60fps, Dolby Vision HDR' },
      'Selfie Camera': { Camera: '12 MP, f/1.9, PDAF', Features: 'Cinematic mode 4K', Video: '4K@60fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 7', Bluetooth: '5.3', GPS: 'GPS, GLONASS, GALILEO, BDS, QZSS', NFC: 'Yes', USB: 'USB Type-C 2.0', Infrared: 'No' },
      Features: { Sensors: 'Face ID, accelerometer, gyro, compass, barometer', Fingerprint: 'No (Face ID)', 'Face Unlock': 'Yes', 'Other Features': 'Camera Control button, Action button, IP68 water resistant' },
      Battery: { Capacity: '3561 mAh', Type: 'Li-Ion', Charging: 'Wired, 50% in 30 min', 'Wireless Charging': '25W MagSafe, 15W Qi2', 'Reverse Charging': '4.5W reverse wired' },
      Price: { Pakistan: 'PKR 279,999', USA: 'USD 799', UAE: 'AED 3,399', India: 'INR 79,900', UK: 'GBP 799' }
    }
  },
  // 19. Xiaomi Redmi Note 14 Pro Plus
  {
    brand: 'xiaomi',
    name: 'Xiaomi Redmi Note 14 Pro Plus 5G',
    slug: 'xiaomi-redmi-note-14-pro-plus-5g',
    release_date: 'October 2024',
    status: 'Available',
    price: 119999,
    featured: 0,
    popular: 1,
    short_desc: 'Snapdragon 7s Gen 3 with 50MP Light Hunter 800 sensor, 2.5x telephoto portrait lens, 6200mAh battery, and 90W fast charging.',
    prices: { Pakistan: 'PKR 119,999', USA: 'USD 349', UAE: 'AED 1,299', India: 'INR 30,999', UK: 'GBP 299' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, September', Status: 'Available. Released October 2024', 'Release Date': 'October 2024' },
      Body: { Dimensions: '162.5 x 74.7 x 8.7 mm', Weight: '211 g', Build: 'Gorilla Glass Victus 2 front, glass back, composite frame', SIM: 'Dual SIM', Colors: 'Midnight Black, Mirror Porcelain White, Frost Green' },
      Display: { Type: 'AMOLED, 68B colors, 120Hz, Dolby Vision, HDR10+, 3000 nits', Size: '6.67 inches (~88.8% screen-to-body ratio)', Resolution: '1220 x 2712 pixels (~446 ppi density)', Protection: 'Gorilla Glass Victus 2', 'Refresh Rate': '120Hz', Brightness: '3000 nits peak' },
      Platform: { OS: 'Android 14, HyperOS', Chipset: 'Qualcomm Snapdragon 7s Gen 3 (4 nm)', CPU: 'Octa-core 2.5 GHz', GPU: 'Adreno 710' },
      Memory: { RAM: '12GB / 16GB', 'Internal Storage': '256GB / 512GB UFS 2.2', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Triple: 50MP Light Hunter 800 + 50MP 2.5x portrait + 8MP ultrawide', 'Main sensor': '50 MP, f/1.6, 1/1.55", Dual Pixel PDAF, OIS', Ultrawide: '8 MP, f/2.2, 120˚', Telephoto: '50 MP, f/2.0, 60mm, 2.5x optical zoom, PDAF', Features: 'LED flash, HDR, AI watermark', Video: '4K@30fps, 1080p@30/60/120fps' },
      'Selfie Camera': { Camera: '20 MP, f/2.2, 26mm', Features: 'HDR', Video: '1080p@30/60fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers with Dolby Atmos', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 6', Bluetooth: '5.4', GPS: 'GPS, GLONASS, BDS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 2.0', Infrared: 'Yes' },
      Features: { Sensors: 'Under-display optical fingerprint, gyro, compass', Fingerprint: 'Under display optical', 'Face Unlock': 'Yes', 'Other Features': 'IP68/IP69K water and hot-water jet proof' },
      Battery: { Capacity: '6200 mAh Silicon-Carbon', Type: 'Li-Po', Charging: '90W wired, 100% in 40 min', 'Wireless Charging': 'No', 'Reverse Charging': 'Reverse wired' },
      Price: { Pakistan: 'PKR 119,999', USA: 'USD 349', UAE: 'AED 1,299', India: 'INR 30,999', UK: 'GBP 299' }
    }
  },
  // 20. Vivo V40 Pro
  {
    brand: 'vivo',
    name: 'Vivo V40 Pro 5G',
    slug: 'vivo-v40-pro-5g',
    release_date: 'August 2024',
    status: 'Available',
    price: 189999,
    featured: 0,
    popular: 1,
    short_desc: 'Zeiss portrait specialist with 50MP main + 50MP 2x telephoto + 50MP selfie camera, Dimensity 9200+, and 5500mAh battery.',
    prices: { Pakistan: 'PKR 189,999', USA: 'USD 599', UAE: 'AED 2,199', India: 'INR 49,999', UK: 'GBP 529' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, August', Status: 'Available. Released August 2024', 'Release Date': 'August 2024' },
      Body: { Dimensions: '164.4 x 75.1 x 7.6 mm', Weight: '192 g', Build: 'Glass front (curved), glass back, plastic frame', SIM: 'Dual SIM', Colors: 'Titanium Grey, Ganges Blue' },
      Display: { Type: 'AMOLED, 1B colors, 120Hz, HDR10+, 4500 nits peak', Size: '6.78 inches 3D Curved (~90.1% screen-to-body ratio)', Resolution: '1260 x 2800 pixels (~453 ppi density)', Protection: 'Schott Xensation Alpha', 'Refresh Rate': '120Hz', Brightness: '4500 nits' },
      Platform: { OS: 'Android 14, Funtouch 14', Chipset: 'MediaTek Dimensity 9200+ (4 nm)', CPU: 'Octa-core 3.35 GHz Cortex-X3', GPU: 'Immortalis-G715 MC11' },
      Memory: { RAM: '12GB LPDDR5X', 'Internal Storage': '512GB UFS 3.1', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Zeiss Triple 50MP: 50MP Sony IMX921 + 50MP Sony IMX816 telephoto + 50MP ultrawide', 'Main sensor': '50 MP, f/1.9, 1/1.56", PDAF, OIS', Ultrawide: '50 MP, f/2.0, 119˚, AF', Telephoto: '50 MP, f/1.85, 50mm, 2x optical zoom, PDAF, OIS', Features: 'Zeiss optics, Zeiss style portrait bokeh, Aura Light ring flash', Video: '4K@30/60fps, gyro-EIS, OIS' },
      'Selfie Camera': { Camera: '50 MP, f/2.0, 21mm, AF with group selfie wide mode', Features: 'Zeiss portrait, HDR', Video: '4K@30/60fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 7', Bluetooth: '5.3', GPS: 'GPS, GLONASS, BDS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 2.0', Infrared: 'No' },
      Features: { Sensors: 'Under-display optical fingerprint, gyro, compass', Fingerprint: 'Under display optical', 'Face Unlock': 'Yes', 'Other Features': 'IP68 dust and water resistant up to 1.5m for 30 mins' },
      Battery: { Capacity: '5500 mAh BlueVolt', Type: 'Li-Ion', Charging: '80W wired FlashCharge', 'Wireless Charging': 'No', 'Reverse Charging': 'Reverse wired' },
      Price: { Pakistan: 'PKR 189,999', USA: 'USD 599', UAE: 'AED 2,199', India: 'INR 49,999', UK: 'GBP 529' }
    }
  },
  // 21. Oppo Reno 12 Pro 5G
  {
    brand: 'oppo',
    name: 'Oppo Reno 12 Pro 5G',
    slug: 'oppo-reno-12-pro-5g',
    release_date: 'June 2024',
    status: 'Available',
    price: 154999,
    featured: 0,
    popular: 0,
    short_desc: 'Sleek quad-micro-curved screen with AI Eraser 2.0, Dimensity 7300-Energy, 50MP telephoto portrait lens, and 80W SuperVOOC.',
    prices: { Pakistan: 'PKR 154,999', USA: 'USD 499', UAE: 'AED 1,899', India: 'INR 36,999', UK: 'GBP 449' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, June', Status: 'Available. Released June 2024', 'Release Date': 'June 2024' },
      Body: { Dimensions: '161.5 x 74.8 x 7.4 mm', Weight: '180 g', Build: 'Gorilla Glass Victus 2 front, plastic/glass back, High-strength alloy framework', SIM: 'Dual SIM', Colors: 'Nebula Silver, Space Brown, Sunset Gold' },
      Display: { Type: 'AMOLED, 1B colors, 120Hz, HDR10+, 1200 nits peak', Size: '6.7 inches Infinite View (~89.5% screen-to-body ratio)', Resolution: '1080 x 2412 pixels (~394 ppi density)', Protection: 'Gorilla Glass Victus 2', 'Refresh Rate': '120Hz', Brightness: '1200 nits' },
      Platform: { OS: 'Android 14, ColorOS 14.1', Chipset: 'MediaTek Dimensity 7300-Energy (4 nm)', CPU: 'Octa-core 2.5 GHz', GPU: 'Mali-G615 MC2' },
      Memory: { RAM: '12GB LPDDR4X', 'Internal Storage': '512GB UFS 3.1', 'Card Slot': 'microSDXC' },
      'Main Camera': { 'Camera configuration': 'Triple: 50MP Sony LYT-600 + 50MP 2x portrait telephoto + 8MP ultrawide', 'Main sensor': '50 MP, f/1.8, 26mm, PDAF, OIS', Ultrawide: '8 MP, f/2.2, 112˚', Telephoto: '50 MP, f/2.0, 47mm, 2x optical zoom, PDAF', Features: 'AI Portrait Retouching, AI Eraser 2.0, AI Studio', Video: '4K@30fps, 1080p@30/60fps' },
      'Selfie Camera': { Camera: '50 MP, f/2.0, 21mm, AF', Features: 'AI Clear Face', Video: '4K@30fps' },
      Sound: { Loudspeaker: 'Yes, dual stereo speakers with 300% Ultra Volume mode', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 6', Bluetooth: '5.4', GPS: 'GPS, GLONASS, BDS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 2.0', Infrared: 'Yes' },
      Features: { Sensors: 'Under-display optical fingerprint, gyro, compass', Fingerprint: 'Under display optical', 'Face Unlock': 'Yes', 'Other Features': 'BeaconLink bluetooth call, IP65 dust and water resistance' },
      Battery: { Capacity: '5000 mAh', Type: 'Li-Po', Charging: '80W wired SuperVOOC, 47% in 18 min', 'Wireless Charging': 'No', 'Reverse Charging': 'Reverse wired' },
      Price: { Pakistan: 'PKR 154,999', USA: 'USD 499', UAE: 'AED 1,899', India: 'INR 36,999', UK: 'GBP 449' }
    }
  },
  // 22. OnePlus Nord 4 5G
  {
    brand: 'oneplus',
    name: 'OnePlus Nord 4 5G',
    slug: 'oneplus-nord-4-5g',
    release_date: 'July 2024',
    status: 'Available',
    price: 134999,
    featured: 0,
    popular: 0,
    short_desc: 'Full metal unibody design in the 5G era with Snapdragon 7+ Gen 3, 5500mAh battery, 100W SuperVOOC, and 6 years of software support.',
    prices: { Pakistan: 'PKR 134,999', USA: 'USD 429', UAE: 'AED 1,599', India: 'INR 29,999', UK: 'GBP 429' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, July', Status: 'Available. Released July 2024', 'Release Date': 'July 2024' },
      Body: { Dimensions: '162.6 x 75.0 x 8.0 mm', Weight: '199 g', Build: 'Glass front, full aluminum unibody metal frame and back', SIM: 'Dual SIM', Colors: 'Mercurial Silver, Obsidian Midnight, Oasis Green' },
      Display: { Type: 'Fluid AMOLED, 1B colors, 120Hz, HDR10+, 2150 nits peak', Size: '6.74 inches (~89.9% screen-to-body ratio)', Resolution: '1240 x 2772 pixels (~450 ppi density)', Protection: 'Shielded glass', 'Refresh Rate': '120Hz', Brightness: '2150 nits' },
      Platform: { OS: 'Android 14, OxygenOS 14.1 (4 OS + 6 years security updates)', Chipset: 'Qualcomm Snapdragon 7+ Gen 3 (4 nm)', CPU: 'Octa-core 2.8 GHz Cortex-X4', GPU: 'Adreno 732' },
      Memory: { RAM: '12GB / 16GB LPDDR5X', 'Internal Storage': '256GB / 512GB UFS 4.0', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Dual: 50MP Sony LYT-600 + 8MP ultrawide', 'Main sensor': '50 MP, f/1.8, 25mm, PDAF, OIS', Ultrawide: '8 MP, f/2.2, 112˚', Telephoto: 'No dedicated telephoto', Features: 'Dual-LED flash, HDR, panorama, AI Best Face', Video: '4K@30/60fps, 1080p@30/60/120fps' },
      'Selfie Camera': { Camera: '16 MP, f/2.4', Features: 'HDR', Video: '1080p@30fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers with Ultra Volume mode', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 6', Bluetooth: '5.4', GPS: 'GPS, GLONASS, BDS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 2.0', Infrared: 'Yes' },
      Features: { Sensors: 'Under-display optical fingerprint, gyro, compass, alert slider', Fingerprint: 'Under display optical', 'Face Unlock': 'Yes', 'Other Features': '3-position Alert Slider, Aqua Touch wet finger tech, IP65' },
      Battery: { Capacity: '5500 mAh', Type: 'Li-Po', Charging: '100W wired SuperVOOC, 100% in 28 min', 'Wireless Charging': 'No', 'Reverse Charging': 'No' },
      Price: { Pakistan: 'PKR 134,999', USA: 'USD 429', UAE: 'AED 1,599', India: 'INR 29,999', UK: 'GBP 429' }
    }
  },
  // 23. Google Pixel 9a
  {
    brand: 'google',
    name: 'Google Pixel 9a',
    slug: 'google-pixel-9a',
    release_date: 'March 2025',
    status: 'Upcoming',
    price: 149999,
    featured: 0,
    popular: 1,
    short_desc: 'Clean flush camera design with Google Tensor G4, 6.3" Actua 120Hz display, 48MP main camera, and 7 years of Pixel drops.',
    prices: { Pakistan: 'PKR 149,999', USA: 'USD 499', UAE: 'AED 1,849', India: 'INR 44,999', UK: 'GBP 499' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2025, March', Status: 'Upcoming', 'Release Date': 'March 2025' },
      Body: { Dimensions: '154.7 x 73.3 x 8.9 mm', Weight: '186 g', Build: 'Gorilla Glass 3 front, composite plastic back, aluminum frame', SIM: 'Nano-SIM and eSIM', Colors: 'Porcelain, Obsidian, Peony, Iris' },
      Display: { Type: 'Actua OLED, 120Hz, HDR, 1800 nits peak', Size: '6.3 inches (~85.5% screen-to-body ratio)', Resolution: '1080 x 2424 pixels (~422 ppi density)', Protection: 'Corning Gorilla Glass 3', 'Refresh Rate': '60-120Hz', Brightness: '1800 nits' },
      Platform: { OS: 'Android 15 (7 years of updates)', Chipset: 'Google Tensor G4 (4 nm)', CPU: 'Octa-core 3.1 GHz', GPU: 'Mali-G715 MC7' },
      Memory: { RAM: '8GB LPDDR5X', 'Internal Storage': '128GB / 256GB UFS 3.1', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Dual: 48MP primary + 13MP ultrawide', 'Main sensor': '48 MP, f/1.7, Dual Pixel PDAF, OIS', Ultrawide: '13 MP, f/2.2, 120˚', Telephoto: 'Super Res Zoom up to 8x', Features: 'Best Take, Magic Audio Eraser, Night Sight', Video: '4K@30/60fps, 1080p@30/60/120/240fps' },
      'Selfie Camera': { Camera: '13 MP, f/2.2', Features: 'Auto-HDR', Video: '4K@30fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 6e', Bluetooth: '5.3', GPS: 'GPS, GLONASS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 3.2', Infrared: 'No' },
      Features: { Sensors: 'Optical under-display fingerprint, gyro, compass, barometer', Fingerprint: 'Under display optical', 'Face Unlock': 'Yes (Face Unlock Class 3)', 'Other Features': 'IP67 dust and water resistant, Gemini Nano AI on-device' },
      Battery: { Capacity: '5000 mAh', Type: 'Li-Ion', Charging: '18W wired, PD3.0', 'Wireless Charging': '7.5W wireless Qi', 'Reverse Charging': 'No' },
      Price: { Pakistan: 'PKR 149,999', USA: 'USD 499', UAE: 'AED 1,849', India: 'INR 44,999', UK: 'GBP 499' }
    }
  },
  // 24. Realme 13 Pro Plus 5G
  {
    brand: 'realme',
    name: 'Realme 13 Pro Plus 5G',
    slug: 'realme-13-pro-plus-5g',
    release_date: 'August 2024',
    status: 'Available',
    price: 109999,
    featured: 0,
    popular: 0,
    short_desc: 'Monet-inspired glass design with world-first Sony LYT-701 sensor, Sony LYT-600 3x periscope zoom, and 80W Ultra Charge.',
    prices: { Pakistan: 'PKR 109,999', USA: 'USD 369', UAE: 'AED 1,349', India: 'INR 32,999', UK: 'GBP 329' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, July', Status: 'Available. Released August 2024', 'Release Date': 'August 2024' },
      Body: { Dimensions: '161.3 x 73.9 x 8.2 mm', Weight: '185 g', Build: 'Gorilla Glass 7i front, Monet textured glass back', SIM: 'Dual SIM', Colors: 'Monet Gold, Monet Purple, Emerald Green' },
      Display: { Type: 'AMOLED, 1B colors, 120Hz, 2000 nits peak', Size: '6.7 inches curved (~90.0% screen-to-body ratio)', Resolution: '1080 x 2412 pixels (~394 ppi density)', Protection: 'Corning Gorilla Glass 7i', 'Refresh Rate': '120Hz', Brightness: '2000 nits' },
      Platform: { OS: 'Android 14, Realme UI 5.0', Chipset: 'Snapdragon 7s Gen 2 (4 nm)', CPU: 'Octa-core 2.40 GHz', GPU: 'Adreno 710' },
      Memory: { RAM: '8GB / 12GB', 'Internal Storage': '256GB / 512GB UFS 3.1', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'HYPERIMAGE+ Triple: 50MP Sony LYT-701 + 50MP Sony LYT-600 3x periscope + 8MP ultrawide', 'Main sensor': '50 MP, f/1.88, 24mm, 1/1.56", multi-directional PDAF, OIS', Ultrawide: '8 MP, f/2.2, 112˚', Telephoto: '50 MP, f/2.65, 73mm periscope, 3x optical, 120x SuperZoom, OIS', Features: 'AI Ultra Clarity, AI Smart Removal, TUV Rheinland eye comfort', Video: '4K@30fps, 1080p@30/60/120fps' },
      'Selfie Camera': { Camera: '32 MP, f/2.45, 21mm', Features: 'Panorama, HDR', Video: '4K@30fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers with Hi-Res Audio', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 6', Bluetooth: '5.2', GPS: 'GPS, GLONASS, BDS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 2.0', Infrared: 'No' },
      Features: { Sensors: 'Under-display optical fingerprint, gyro, compass', Fingerprint: 'Under display optical', 'Face Unlock': 'Yes', 'Other Features': 'IP65 dust and water resistant, Rainwater Smart Touch' },
      Battery: { Capacity: '5200 mAh', Type: 'Li-Ion', Charging: '80W wired SuperVOOC, 50% in 19 min', 'Wireless Charging': 'No', 'Reverse Charging': 'No' },
      Price: { Pakistan: 'PKR 109,999', USA: 'USD 369', UAE: 'AED 1,349', India: 'INR 32,999', UK: 'GBP 329' }
    }
  },
  // 25. Tecno Spark 20 Pro Plus
  {
    brand: 'tecno',
    name: 'Tecno Spark 20 Pro Plus',
    slug: 'tecno-spark-20-pro-plus',
    release_date: 'February 2024',
    status: 'Available',
    price: 49999,
    featured: 0,
    popular: 0,
    short_desc: 'Budget champion with 108MP camera, 120Hz curved AMOLED screen, Helio G99 Ultimate, and stereo speakers.',
    prices: { Pakistan: 'PKR 49,999', USA: 'USD 179', UAE: 'AED 649', India: 'INR 14,999', UK: 'GBP 149' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1, 3, 5, 8, 38, 40, 41', '5G': 'No (4G LTE)', Speed: 'HSPA, LTE' },
      Launch: { Announced: '2024, January', Status: 'Available. Released February 2024', 'Release Date': 'February 2024' },
      Body: { Dimensions: '164.7 x 75.0 x 7.6 mm', Weight: '179 g', Build: 'Glass front (Gorilla Glass 5), leatherette/plastic back', SIM: 'Dual SIM', Colors: 'Temporal Orbits, Lunar Frost, Radiant Starstream, Magic Skin 2.0 Green' },
      Display: { Type: 'AMOLED, 1B colors, 120Hz, 1000 nits peak', Size: '6.78 inches curved (~89.0% screen-to-body ratio)', Resolution: '1080 x 2436 pixels (~393 ppi density)', Protection: 'Corning Gorilla Glass 5', 'Refresh Rate': '120Hz', Brightness: '1000 nits' },
      Platform: { OS: 'Android 14, HIOS 14', Chipset: 'Mediatek Helio G99 Ultimate (6 nm)', CPU: 'Octa-core (2x2.2 GHz Cortex-A76 + 6x2.0 GHz Cortex-A55)', GPU: 'Mali-G57 MC2' },
      Memory: { RAM: '8GB + 8GB extended', 'Internal Storage': '256GB', 'Card Slot': 'microSDXC' },
      'Main Camera': { 'Camera configuration': '108MP main + 0.08MP auxiliary lens', 'Main sensor': '108 MP, f/1.75, 1/1.67", 0.64µm, PDAF', Ultrawide: 'No', Telephoto: '3x lossless sensor zoom', Features: 'Quad-LED flash, HDR, Super Night mode', Video: '1440p@30fps, 1080p@30fps' },
      'Selfie Camera': { Camera: '32 MP, f/2.2 with dual-color LED flash', Features: 'Dual-LED flash', Video: '1080p@30fps' },
      Sound: { Loudspeaker: 'Yes, dual stereo speakers with DTS sound', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 802.11 a/b/g/n/ac, dual-band', Bluetooth: '5.2', GPS: 'GPS, GLONASS', NFC: 'Yes', USB: 'USB Type-C 2.0', Infrared: 'No' },
      Features: { Sensors: 'Under-display optical fingerprint, gyro, proximity', Fingerprint: 'Under display optical', 'Face Unlock': 'Yes', 'Other Features': 'Dynamic Port notification pill, IP53 dust and splash proof' },
      Battery: { Capacity: '5000 mAh', Type: 'Li-Po', Charging: '33W wired', 'Wireless Charging': 'No', 'Reverse Charging': 'No' },
      Price: { Pakistan: 'PKR 49,999', USA: 'USD 179', UAE: 'AED 649', India: 'INR 14,999', UK: 'GBP 149' }
    }
  },
  // 26. Infinix Note 40 Pro Plus 5G
  {
    brand: 'infinix',
    name: 'Infinix Note 40 Pro Plus 5G',
    slug: 'infinix-note-40-pro-plus-5g',
    release_date: 'April 2024',
    status: 'Available',
    price: 79999,
    featured: 0,
    popular: 0,
    short_desc: 'All-Round FastCharge 2.0 with 100W wired and 20W magnetic wireless charging, 108MP OIS camera, and Dimensity 7020.',
    prices: { Pakistan: 'PKR 79,999', USA: 'USD 299', UAE: 'AED 1,099', India: 'INR 21,999', UK: 'GBP 249' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1, 3, 5, 8, 20, 28, 38, 40, 41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, March', Status: 'Available. Released April 2024', 'Release Date': 'April 2024' },
      Body: { Dimensions: '164.3 x 74.5 x 8.1 mm', Weight: '190 g', Build: 'Glass front (Gorilla Glass), faux leather back', SIM: 'Dual SIM', Colors: 'Obsidian Black, Vintage Green' },
      Display: { Type: 'AMOLED, 1B colors, 120Hz, 1300 nits peak', Size: '6.78 inches 3D curved (~89.6% screen-to-body ratio)', Resolution: '1080 x 2436 pixels (~393 ppi density)', Protection: 'Corning Gorilla Glass', 'Refresh Rate': '120Hz', Brightness: '1300 nits' },
      Platform: { OS: 'Android 14, XOS 14 (Cheetah X1 power management chip)', Chipset: 'MediaTek Dimensity 7020 (6 nm)', CPU: 'Octa-core 2.2 GHz', GPU: 'IMG BXM-8-256' },
      Memory: { RAM: '12GB + 12GB Extended', 'Internal Storage': '256GB UFS 2.2', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Triple: 108MP + 2MP macro + 2MP depth', 'Main sensor': '108 MP, f/1.75, 1/1.67", PDAF, OIS', Ultrawide: 'No', Telephoto: '3x lossless sensor zoom', Features: 'Active Halo AI lighting, Dual-LED flash', Video: '1440p@30fps, 1080p@30/60fps' },
      'Selfie Camera': { Camera: '32 MP, f/2.2 with dual-LED flash', Features: 'Dual-LED flash', Video: '1080p@30fps' },
      Sound: { Loudspeaker: 'Yes, dual stereo speakers tuned by JBL', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 802.11 a/b/g/n/ac', Bluetooth: '5.2', GPS: 'GPS', NFC: 'Yes', USB: 'USB Type-C 2.0', Infrared: 'Yes' },
      Features: { Sensors: 'Under-display optical fingerprint, gyro, proximity', Fingerprint: 'Under display optical', 'Face Unlock': 'Yes', 'Other Features': 'Active Halo smart lighting effect, IP53 rating' },
      Battery: { Capacity: '4600 mAh', Type: 'Li-Po', Charging: '100W Multi-speed wired, 50% in 12 min', 'Wireless Charging': '20W Wireless MagCharge', 'Reverse Charging': 'Reverse wired + reverse wireless' },
      Price: { Pakistan: 'PKR 79,999', USA: 'USD 299', UAE: 'AED 1,099', India: 'INR 21,999', UK: 'GBP 249' }
    }
  },
  // 27. Motorola Razr 50 Ultra
  {
    brand: 'motorola',
    name: 'Motorola Razr 50 Ultra',
    slug: 'motorola-razr-50-ultra',
    release_date: 'July 2024',
    status: 'Available',
    price: 259999,
    featured: 0,
    popular: 0,
    short_desc: 'Futuristic foldable phone with huge 4.0-inch 165Hz external cover screen, Snapdragon 8s Gen 3, and 50MP 2x telephoto camera.',
    prices: { Pakistan: 'PKR 259,999', USA: 'USD 999', UAE: 'AED 3,699', India: 'INR 89,999', UK: 'GBP 999' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, June', Status: 'Available. Released July 2024', 'Release Date': 'July 2024' },
      Body: { Dimensions: 'Unfolded: 171.4 x 74.0 x 7.1 mm; Folded: 88.1 x 74.0 x 15.3 mm', Weight: '189 g', Build: 'Plastic front (unfolded), Gorilla Glass Victus front (folded), vegan leather back, 6000-series aluminum frame', SIM: 'Nano-SIM and eSIM', Colors: 'Midnight Blue, Spring Green, Peach Fuzz, Hot Pink' },
      Display: { Type: 'Foldable LTPO AMOLED, 1B colors, 165Hz, Dolby Vision, HDR10+, 3000 nits; Cover display: LTPO AMOLED, 165Hz, 4.0 inches, 2400 nits', Size: '6.9 inches inner (~85.0% ratio); 4.0 inches outer', Resolution: '1080 x 2640 pixels (~413 ppi density)', Protection: 'Gorilla Glass Victus (cover screen)', 'Refresh Rate': '1-165Hz LTPO', Brightness: '3000 nits inner, 2400 nits outer' },
      Platform: { OS: 'Android 14, Moto Hello UI', Chipset: 'Snapdragon 8s Gen 3 (4 nm)', CPU: 'Octa-core 3.0 GHz Cortex-X4', GPU: 'Adreno 735' },
      Memory: { RAM: '12GB LPDDR5X', 'Internal Storage': '512GB UFS 4.0', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Dual: 50MP main + 50MP 2x telephoto', 'Main sensor': '50 MP, f/1.7, 24mm, 1/1.95", dual pixel PDAF, OIS', Ultrawide: 'No (outer screen acts as viewfinder for selfies)', Telephoto: '50 MP, f/2.0, 47mm, 2x optical zoom, PDAF', Features: 'LED flash, Moto AI, HDR, panorama', Video: '4K@30/60fps, 1080p@30/60/120fps' },
      'Selfie Camera': { Camera: '32 MP, f/2.4 inner camera', Features: 'HDR', Video: '4K@30/60fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers with Dolby Atmos and Spatial Audio', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 7', Bluetooth: '5.4', GPS: 'GPS, GLONASS, BDS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 2.0', Infrared: 'No' },
      Features: { Sensors: 'Side-mounted fingerprint, gyro, compass, proximity', Fingerprint: 'Side-mounted physical', 'Face Unlock': 'Yes', 'Other Features': 'IPX8 water resistant up to 1.5m, teardrop hinge with zero gap' },
      Battery: { Capacity: '4000 mAh', Type: 'Li-Po', Charging: '45W wired TurboPower', 'Wireless Charging': '15W wireless', 'Reverse Charging': '5W reverse wired' },
      Price: { Pakistan: 'PKR 259,999', USA: 'USD 999', UAE: 'AED 3,699', India: 'INR 89,999', UK: 'GBP 999' }
    }
  },
  // 28. Sony Xperia 10 VI
  {
    brand: 'sony',
    name: 'Sony Xperia 10 VI',
    slug: 'sony-xperia-10-vi',
    release_date: 'June 2024',
    status: 'Available',
    price: 119999,
    featured: 0,
    popular: 0,
    short_desc: 'Lightweight compact body with 2-day 5000mAh battery life, 3.5mm jack, front stereo speakers, and Snapdragon 6 Gen 1.',
    prices: { Pakistan: 'PKR 119,999', USA: 'USD 399', UAE: 'AED 1,449', India: 'INR 34,999', UK: 'GBP 349' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1, 3, 7, 8, 20, 28, 38, 40, 41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, May', Status: 'Available. Released June 2024', 'Release Date': 'June 2024' },
      Body: { Dimensions: '155 x 68 x 8.3 mm', Weight: '164 g', Build: 'Gorilla Glass Victus front, plastic frame, recycled resin back', SIM: 'Nano-SIM and eSIM', Colors: 'Black, White, Blue' },
      Display: { Type: 'OLED, 1B colors, HDR, Triluminos display for mobile', Size: '6.1 inches 21:9 ratio (~82.5% screen-to-body ratio)', Resolution: '1080 x 2520 pixels (~449 ppi density)', Protection: 'Gorilla Glass Victus', 'Refresh Rate': '60Hz', Brightness: '1000 nits' },
      Platform: { OS: 'Android 14 (3 OS upgrades guaranteed)', Chipset: 'Qualcomm Snapdragon 6 Gen 1 (4 nm)', CPU: 'Octa-core 2.2 GHz Cortex-A78', GPU: 'Adreno 710' },
      Memory: { RAM: '8GB', 'Internal Storage': '128GB UFS 2.2', 'Card Slot': 'microSDXC (shared slot)' },
      'Main Camera': { 'Camera configuration': 'Dual: 48MP main + 8MP ultrawide', 'Main sensor': '48 MP, f/1.8, 26mm, PDAF, OIS', Ultrawide: '8 MP, f/2.2, 16mm, 120˚', Telephoto: '2x in-sensor optical zoom (52mm equivalent)', Features: 'LED flash, HDR, Video Creator tool', Video: '4K@30fps, 1080p@30/60/120fps' },
      'Selfie Camera': { Camera: '8 MP, f/2.0, 26mm', Features: 'HDR', Video: '1080p@30fps' },
      Sound: { Loudspeaker: 'Yes, with front-facing stereo speakers', '3.5mm Jack': 'Yes (Hi-Res Audio, DSEE Ultimate, LDAC)' },
      Connectivity: { WLAN: 'Wi-Fi 802.11 a/b/g/n/ac, dual-band', Bluetooth: '5.2, aptX HD, LDAC', GPS: 'GPS, GLONASS, BDS, GALILEO, QZSS', NFC: 'Yes', USB: 'USB Type-C 2.0', Infrared: 'No' },
      Features: { Sensors: 'Side-mounted fingerprint, accelerometer, proximity, compass', Fingerprint: 'Side-mounted', 'Face Unlock': 'No', 'Other Features': 'IP65/IP68 dust and water proof' },
      Battery: { Capacity: '5000 mAh', Type: 'Li-Po', Charging: 'Fast wired charging, USB Power Delivery', 'Wireless Charging': 'No', 'Reverse Charging': 'No' },
      Price: { Pakistan: 'PKR 119,999', USA: 'USD 399', UAE: 'AED 1,449', India: 'INR 34,999', UK: 'GBP 349' }
    }
  },
  // 29. Honor 200 Pro
  {
    brand: 'honor',
    name: 'Honor 200 Pro',
    slug: 'honor-200-pro',
    release_date: 'June 2024',
    status: 'Available',
    price: 174999,
    featured: 0,
    popular: 0,
    short_desc: 'Studio Harcourt Paris portrait algorithms with 50MP Sony telephoto, Snapdragon 8s Gen 3, and 100W SuperCharge.',
    prices: { Pakistan: 'PKR 174,999', USA: 'USD 599', UAE: 'AED 2,299', India: 'INR 47,999', UK: 'GBP 599' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, May', Status: 'Available. Released June 2024', 'Release Date': 'June 2024' },
      Body: { Dimensions: '163.3 x 75.2 x 8.2 mm', Weight: '199 g', Build: 'Glass front, glass back with dual texture, plastic frame', SIM: 'Dual SIM', Colors: 'Ocean Cyan, Moonlight White, Black' },
      Display: { Type: 'OLED, 1B colors, 120Hz, HDR, 4000 nits peak, 3840Hz PWM dimming', Size: '6.78 inches quad-curved (~90.8% screen-to-body ratio)', Resolution: '1224 x 2700 pixels (~437 ppi density)', Protection: 'Aluminosilicate glass', 'Refresh Rate': '120Hz', Brightness: '4000 nits' },
      Platform: { OS: 'Android 14, MagicOS 8.0', Chipset: 'Snapdragon 8s Gen 3 (4 nm)', CPU: 'Octa-core 3.0 GHz', GPU: 'Adreno 735' },
      Memory: { RAM: '12GB / 16GB', 'Internal Storage': '512GB', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Triple: 50MP OmniVision main + 50MP Sony IMX856 2.5x telephoto + 12MP ultrawide macro', 'Main sensor': '50 MP, f/1.9, 1/1.3", PDAF, OIS', Ultrawide: '12 MP, f/2.2, 112˚, AF macro', Telephoto: '50 MP, f/2.4, 2.5x optical zoom, PDAF, OIS', Features: 'Studio Harcourt Paris Portrait Mode, AI natural bokeh', Video: '4K@30/60fps, gyro-EIS, OIS' },
      'Selfie Camera': { Camera: '50 MP, f/2.1 + 2MP 3D depth sensor', Features: 'HDR', Video: '4K@30fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers with spatial audio effect', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 6', Bluetooth: '5.3', GPS: 'GPS, GLONASS, BDS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 2.0', Infrared: 'Yes' },
      Features: { Sensors: 'Under-display optical fingerprint, gyro, compass', Fingerprint: 'Under display optical', 'Face Unlock': 'Yes', 'Other Features': 'IP55 dust and water resistant, AI Magic Portal' },
      Battery: { Capacity: '5200 mAh Silicon-Carbon', Type: 'Li-Po', Charging: '100W wired SuperCharge, 60% in 15 min', 'Wireless Charging': '66W wireless SuperCharge', 'Reverse Charging': '5W reverse wireless' },
      Price: { Pakistan: 'PKR 174,999', USA: 'USD 599', UAE: 'AED 2,299', India: 'INR 47,999', UK: 'GBP 599' }
    }
  },
  // 30. Xiaomi Poco F6 Pro
  {
    brand: 'xiaomi',
    name: 'Xiaomi Poco F6 Pro',
    slug: 'xiaomi-poco-f6-pro',
    release_date: 'May 2024',
    status: 'Available',
    price: 139999,
    featured: 0,
    popular: 1,
    short_desc: 'Flagship killer with Snapdragon 8 Gen 2, WQHD+ 120Hz Flow AMOLED display, 120W HyperCharge, and Light Fusion 800 sensor.',
    prices: { Pakistan: 'PKR 139,999', USA: 'USD 449', UAE: 'AED 1,649', India: 'INR 38,999', UK: 'GBP 449' },
    specs: {
      Network: { Technology: 'GSM / HSPA / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, May', Status: 'Available. Released May 2024', 'Release Date': 'May 2024' },
      Body: { Dimensions: '160.9 x 75.0 x 8.2 mm', Weight: '209 g', Build: 'Gorilla Glass 5 front, velvety matte glass back, metal frame', SIM: 'Dual SIM', Colors: 'Black, White' },
      Display: { Type: 'Flow AMOLED, 68B colors, 120Hz, Dolby Vision, HDR10+, 4000 nits peak', Size: '6.67 inches (~89.0% screen-to-body ratio)', Resolution: '1440 x 3200 pixels (~526 ppi density)', Protection: 'Corning Gorilla Glass 5', 'Refresh Rate': '120Hz', Brightness: '4000 nits' },
      Platform: { OS: 'Android 14, HyperOS with WildBoost Optimization 3.0', Chipset: 'Qualcomm Snapdragon 8 Gen 2 (4 nm)', CPU: 'Octa-core 3.2 GHz Cortex-X3', GPU: 'Adreno 740' },
      Memory: { RAM: '12GB / 16GB LPDDR5X', 'Internal Storage': '256GB / 512GB / 1TB UFS 4.0', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Triple: 50MP Light Fusion 800 + 8MP ultrawide + 2MP macro', 'Main sensor': '50 MP, f/1.6, 1/1.55", Dual Pixel PDAF, OIS', Ultrawide: '8 MP, f/2.2, 119˚', Telephoto: 'No', Features: 'Dual-LED flash, HDR, Burst shot 2.0 50fps', Video: '8K@24fps, 4K@30/60fps, 1080p@30/60/120/240/960fps' },
      'Selfie Camera': { Camera: '16 MP, f/2.4', Features: 'HDR', Video: '1080p@30/60fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers with Dolby Atmos & Hi-Res', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 7', Bluetooth: '5.3', GPS: 'GPS, GLONASS, BDS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 2.0', Infrared: 'Yes' },
      Features: { Sensors: 'Under-display optical fingerprint, heart rate monitor, gyro, compass', Fingerprint: 'Under display optical with heart rate', 'Face Unlock': 'Yes', 'Other Features': 'LiquidCool Technology 4.0 with Iceloop' },
      Battery: { Capacity: '5000 mAh', Type: 'Li-Po', Charging: '120W HyperCharge, 100% in 19 min', 'Wireless Charging': 'No', 'Reverse Charging': 'No' },
      Price: { Pakistan: 'PKR 139,999', USA: 'USD 449', UAE: 'AED 1,649', India: 'INR 38,999', UK: 'GBP 449' }
    }
  },
  // 31. Samsung Galaxy Z Fold 6
  {
    brand: 'samsung',
    name: 'Samsung Galaxy Z Fold 6',
    slug: 'samsung-galaxy-z-fold-6',
    release_date: 'July 2024',
    status: 'Available',
    price: 499999,
    featured: 1,
    popular: 1,
    short_desc: 'Next-era book-fold with symmetrical slim design, Galaxy AI, Snapdragon 8 Gen 3 for Galaxy, and dual 120Hz AMOLED screens.',
    prices: { Pakistan: 'PKR 499,999', USA: 'USD 1,899', UAE: 'AED 7,199', India: 'INR 164,999', UK: 'GBP 1,799' },
    specs: {
      Network: { Technology: 'GSM / CDMA / HSPA / EVDO / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'Bands 1-41', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2024, July', Status: 'Available. Released July 2024', 'Release Date': 'July 2024' },
      Body: { Dimensions: 'Unfolded: 153.5 x 132.6 x 5.6 mm; Folded: 153.5 x 68.1 x 12.1 mm', Weight: '239 g', Build: 'Glass front (Gorilla Glass Victus 2 folded), plastic front (unfolded), glass back, Enhanced Armor Aluminum frame', SIM: 'Nano-SIM and eSIM', Colors: 'Silver Shadow, Pink, Navy, Crafted Black, White' },
      Display: { Type: 'Foldable Dynamic LTPO AMOLED 2X, 120Hz, HDR10+, 2600 nits; Cover: Dynamic LTPO AMOLED 2X, 120Hz, 6.3 inches', Size: '7.6 inches inner (~91.0% ratio); 6.3 inches outer', Resolution: '1856 x 2160 pixels (~374 ppi density)', Protection: 'Gorilla Glass Victus 2 (cover)', 'Refresh Rate': '1-120Hz', Brightness: '2600 nits peak' },
      Platform: { OS: 'Android 14, One UI 6.1.1 (7 years updates)', Chipset: 'Snapdragon 8 Gen 3 for Galaxy (4 nm)', CPU: 'Octa-core 3.39 GHz', GPU: 'Adreno 750 (1 GHz)' },
      Memory: { RAM: '12GB LPDDR5X', 'Internal Storage': '256GB / 512GB / 1TB UFS 4.0', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Triple: 50MP + 10MP 3x telephoto + 12MP ultrawide', 'Main sensor': '50 MP, f/1.8, 23mm, Dual Pixel PDAF, OIS', Ultrawide: '12 MP, f/2.2, 123˚', Telephoto: '10 MP, f/2.4, 66mm, 3x optical zoom, PDAF, OIS', Features: 'LED flash, HDR, Galaxy AI ProVisual Engine', Video: '8K@30fps, 4K@60/120fps' },
      'Selfie Camera': { Camera: '4 MP under-display camera (inner) + 10 MP cover camera', Features: 'HDR', Video: '4K@30/60fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers tuned by AKG', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 6e', Bluetooth: '5.3', GPS: 'GPS, GLONASS, BDS, GALILEO, QZSS', NFC: 'Yes', USB: 'USB Type-C 3.2, OTG, DisplayPort', Infrared: 'No' },
      Features: { Sensors: 'Side-mounted capacitive fingerprint, gyro, compass, barometer, UWB', Fingerprint: 'Side-mounted', 'Face Unlock': 'Yes', 'Other Features': 'S-Pen support, Samsung DeX desktop mode, IP48 water resistance' },
      Battery: { Capacity: '4400 mAh', Type: 'Li-Po', Charging: '25W wired, 50% in 30 min', 'Wireless Charging': '15W wireless', 'Reverse Charging': '4.5W reverse wireless' },
      Price: { Pakistan: 'PKR 499,999', USA: 'USD 1,899', UAE: 'AED 7,199', India: 'INR 164,999', UK: 'GBP 1,799' }
    }
  },
  // 32. Apple iPhone 15 Pro Max
  {
    brand: 'apple',
    name: 'Apple iPhone 15 Pro Max',
    slug: 'apple-iphone-15-pro-max',
    release_date: 'September 2023',
    status: 'Available',
    price: 339999,
    featured: 0,
    popular: 1,
    short_desc: 'Lightweight titanium design with A17 Pro chip, Action button, USB-C 3.0, and 5x tetraprism optical telephoto zoom.',
    prices: { Pakistan: 'PKR 339,999', USA: 'USD 999', UAE: 'AED 3,999', India: 'INR 129,900', UK: 'GBP 1,049' },
    specs: {
      Network: { Technology: 'GSM / CDMA / HSPA / EVDO / LTE / 5G', '2G': 'GSM 850 / 900 / 1800 / 1900', '3G': 'HSDPA 850 / 900 / 2100', '4G': 'All standard LTE bands', '5G': 'SA/NSA', Speed: 'HSPA, LTE, 5G' },
      Launch: { Announced: '2023, September', Status: 'Available. Released September 2023', 'Release Date': 'September 2023' },
      Body: { Dimensions: '159.9 x 76.7 x 8.3 mm', Weight: '221 g', Build: 'Ceramic Shield front, textured matte glass back, Titanium frame (grade 5)', SIM: 'Nano-SIM and eSIM', Colors: 'Natural Titanium, Blue Titanium, White Titanium, Black Titanium' },
      Display: { Type: 'LTPO Super Retina XDR OLED, 120Hz, Dolby Vision, 2000 nits', Size: '6.7 inches (~89.8% screen-to-body ratio)', Resolution: '1290 x 2796 pixels (~460 ppi density)', Protection: 'Ceramic Shield glass', 'Refresh Rate': '1-120Hz ProMotion', Brightness: '2000 nits' },
      Platform: { OS: 'iOS 17, upgradable to iOS 18', Chipset: 'Apple A17 Pro (3 nm)', CPU: 'Hexa-core (2x3.78 GHz + 4x2.11 GHz)', GPU: 'Apple GPU (6-core graphics with hardware ray tracing)' },
      Memory: { RAM: '8GB', 'Internal Storage': '256GB / 512GB / 1TB NVMe', 'Card Slot': 'No' },
      'Main Camera': { 'Camera configuration': 'Triple: 48MP + 12MP 5x periscope + 12MP ultrawide + TOF 3D LiDAR', 'Main sensor': '48 MP, f/1.8, 24mm, sensor-shift OIS', Ultrawide: '12 MP, f/2.2, 13mm, 120˚', Telephoto: '12 MP, f/2.8, 120mm, 5x optical zoom, 3D sensor-shift OIS', Features: 'Dual-LED dual-tone flash, HDR, ProRes video, Log', Video: '4K@24/25/30/60fps, ProRes 4K@60fps via external SSD' },
      'Selfie Camera': { Camera: '12 MP, f/1.9, PDAF, OIS', Features: 'Cinematic mode 4K', Video: '4K@60fps' },
      Sound: { Loudspeaker: 'Yes, stereo speakers', '3.5mm Jack': 'No' },
      Connectivity: { WLAN: 'Wi-Fi 6e', Bluetooth: '5.3', GPS: 'Dual-frequency GPS, GLONASS, GALILEO', NFC: 'Yes', USB: 'USB Type-C 3.2 Gen 2 (up to 10Gbps)', Infrared: 'No' },
      Features: { Sensors: 'Face ID, LiDAR scanner, accelerometer, gyro, barometer', Fingerprint: 'No (Face ID)', 'Face Unlock': 'Yes', 'Other Features': 'Action button, Satellite SOS, Apple Intelligence' },
      Battery: { Capacity: '4441 mAh', Type: 'Li-Ion', Charging: 'Wired, 50% in 30 min', 'Wireless Charging': '15W MagSafe, 15W Qi2', 'Reverse Charging': '4.5W reverse wired' },
      Price: { Pakistan: 'PKR 339,999', USA: 'USD 999', UAE: 'AED 3,999', India: 'INR 129,900', UK: 'GBP 1,049' }
    }
  }
];

const sampleNews = [
  {
    title: 'Samsung Galaxy S26 Ultra Leaks: 200MP Quad-Tele Camera & 3nm Chip',
    slug: 'samsung-galaxy-s26-ultra-leaks-quad-tele-camera',
    content: 'Details around the upcoming Samsung Galaxy S26 Ultra reveal next-generation 200MP sensors paired with a custom Qualcomm Snapdragon 8 Elite Gen 2 chipset and enhanced anti-reflective Gorilla Armor glass.'
  },
  {
    title: 'Apple Unveils iOS 20 with Deep Apple Intelligence Integration',
    slug: 'apple-unveils-ios-20-apple-intelligence',
    content: 'Apple previewed its upcoming iOS 20 software update featuring cross-app actions powered by Apple Intelligence, expanded Siri capabilities, and new customization features for iPhone 16 and iPhone 17 models.'
  },
  {
    title: 'Top 5 Flagship Smartphones with 6000mAh+ Silicon Batteries in 2025',
    slug: 'top-5-flagship-smartphones-with-6000mah-batteries',
    content: 'Silicon-carbon battery technology has revolutionized smartphone battery endurance. Discover which latest flagships from OnePlus, Xiaomi, Realme, and Vivo offer 2-day real-world battery life without adding thickness.'
  }
];

async function seed() {
  console.log('🚀 Starting PhonesDaddy database setup & seed...');
  
  // Connect to MySQL server (without specifying DB first to ensure creation)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    // Read and execute schema.sql
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(schemaSql);
    console.log('✅ Database schema created/verified.');

    await connection.changeUser({ database: process.env.DB_NAME || 'phonesdaddy' });

    // Seed Admin user (admin / admin123)
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await connection.query(`
      INSERT INTO admins (username, password_hash, name)
      VALUES ('admin', ?, 'PhonesDaddy Master Admin')
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name)
    `, [adminPasswordHash]);
    console.log('✅ Admin user created/verified: username "admin", password "admin123"');

    // Seed Brands
    const brandMap = {}; // name/slug -> id
    for (const b of brandsData) {
      // Create SVG logo file
      const logoSvg = generateBrandSvg(b.name, b.color);
      const logoFilename = `${b.slug}-logo.svg`;
      fs.writeFileSync(path.join(__dirname, '../public/images/brands', logoFilename), logoSvg);
      const logoUrl = `/images/brands/${logoFilename}`;

      const [res] = await connection.query(`
        INSERT INTO brands (name, slug, logo, description, status)
        VALUES (?, ?, ?, ?, 'active')
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          logo = VALUES(logo),
          description = VALUES(description),
          status = 'active'
      `, [b.name, b.slug, logoUrl, b.desc]);

      // fetch id
      const [rows] = await connection.query(`SELECT id FROM brands WHERE slug = ?`, [b.slug]);
      if (rows.length > 0) {
        brandMap[b.slug] = rows[0].id;
      }
    }
    console.log(`✅ Seeded ${brandsData.length} brands with vector logos.`);

    // Seed Phones
    let phoneCount = 0;
    for (const p of phonesData) {
      const brandId = brandMap[p.brand];
      if (!brandId) {
        console.warn(`Brand not found for ${p.brand}, skipping phone ${p.name}`);
        continue;
      }

      // Generate phone image SVG
      const phoneSvg = generatePhoneSvg(p.name, p.brand.toUpperCase());
      const imageFilename = `${p.slug}.svg`;
      fs.writeFileSync(path.join(__dirname, '../public/images/phones', imageFilename), phoneSvg);
      const imageUrl = `/images/phones/${imageFilename}`;

      const metaTitle = `${p.name} Price in Pakistan & Specifications | PhonesDaddy`;
      const metaDescription = `${p.name} full specifications, price in Pakistan (PKR ${p.price.toLocaleString()}), camera, battery, display, processor, RAM, and comparison details.`;

      await connection.query(`
        INSERT INTO phones (brand_id, name, slug, short_description, image, release_date, status, price, featured, popular, views, meta_title, meta_description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 120, ?, ?)
        ON DUPLICATE KEY UPDATE
          brand_id = VALUES(brand_id),
          name = VALUES(name),
          short_description = VALUES(short_description),
          image = VALUES(image),
          release_date = VALUES(release_date),
          status = VALUES(status),
          price = VALUES(price),
          featured = VALUES(featured),
          popular = VALUES(popular),
          meta_title = VALUES(meta_title),
          meta_description = VALUES(meta_description)
      `, [brandId, p.name, p.slug, p.short_desc, imageUrl, p.release_date, p.status, p.price, p.featured, p.popular, metaTitle, metaDescription]);

      // Get phone id
      const [pRows] = await connection.query(`SELECT id FROM phones WHERE slug = ?`, [p.slug]);
      const phoneId = pRows[0].id;

      // Delete existing specs and re-insert for freshness
      await connection.query(`DELETE FROM phone_specs WHERE phone_id = ?`, [phoneId]);
      await connection.query(`DELETE FROM phone_prices WHERE phone_id = ?`, [phoneId]);

      // Insert Specs
      let sortOrder = 1;
      for (const [section, sectionFields] of Object.entries(p.specs)) {
        for (const [key, value] of Object.entries(sectionFields)) {
          await connection.query(`
            INSERT INTO phone_specs (phone_id, section, spec_key, spec_value, sort_order)
            VALUES (?, ?, ?, ?, ?)
          `, [phoneId, section, key, String(value), sortOrder++]);
        }
      }

      // Insert Prices
      for (const [country, amountStr] of Object.entries(p.prices)) {
        let currency = 'PKR';
        if (country === 'USA') currency = 'USD';
        if (country === 'UAE') currency = 'AED';
        if (country === 'India') currency = 'INR';
        if (country === 'UK') currency = 'GBP';

        await connection.query(`
          INSERT INTO phone_prices (phone_id, country, currency, amount)
          VALUES (?, ?, ?, ?)
        `, [phoneId, country, currency, amountStr]);
      }

      phoneCount++;
    }
    console.log(`✅ Seeded ${phoneCount} phones with comprehensive specifications and multi-country pricing.`);

    // Seed Sample News
    for (const n of sampleNews) {
      await connection.query(`
        INSERT INTO news (title, slug, content)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content)
      `, [n.title, n.slug, n.content]);
    }
    console.log('✅ Seeded news updates.');

    console.log('🎉 Database seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();

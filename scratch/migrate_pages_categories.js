const { pool } = require('../server/config/database');

async function migrate() {
  console.log('Starting migration for pages and news_categories...');

  // 1. Create news_categories table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`news_categories\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`name\` VARCHAR(100) NOT NULL UNIQUE,
      \`slug\` VARCHAR(100) NOT NULL UNIQUE,
      \`description\` VARCHAR(255) DEFAULT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('Created news_categories table if not exists.');

  // Seed default news categories
  const defaultCategories = [
    { name: 'Hot News', slug: 'hot-news', description: 'Breaking tech headlines and viral mobile updates' },
    { name: 'Leaks & Rumors', slug: 'leaks-rumors', description: 'Upcoming phone leaks, renders, and insider specs' },
    { name: 'Reviews', slug: 'reviews', description: 'In-depth hands-on reviews, camera tests, and battery evaluations' },
    { name: 'Launch Events', slug: 'launch-events', description: 'Global unveiling events, launch dates, and pricing' },
    { name: 'Buying Guides', slug: 'buying-guides', description: 'Best smartphones by budget, camera, and gaming performance' },
    { name: 'Tech Updates', slug: 'tech-updates', description: 'Chipset announcements, OS updates (Android/iOS), and industry trends' }
  ];

  for (const cat of defaultCategories) {
    await pool.query(`
      INSERT INTO \`news_categories\` (name, slug, description)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE description = VALUES(description)
    `, [cat.name, cat.slug, cat.description]);
  }
  console.log('Seeded standard news categories.');

  // 2. Create pages table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`pages\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`title\` VARCHAR(255) NOT NULL,
      \`slug\` VARCHAR(255) NOT NULL UNIQUE,
      \`content\` LONGTEXT DEFAULT NULL,
      \`meta_title\` VARCHAR(255) DEFAULT NULL,
      \`meta_description\` VARCHAR(500) DEFAULT NULL,
      \`status\` ENUM('published', 'draft') DEFAULT 'published',
      \`show_in_footer\` BOOLEAN DEFAULT TRUE,
      \`views\` INT DEFAULT 0,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX \`idx_pages_slug\` (\`slug\`),
      INDEX \`idx_pages_status\` (\`status\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('Created pages table if not exists.');

  // Seed default 4 pages (About Us, Contact Us, Privacy Policy, Disclaimer)
  const defaultPages = [
    {
      title: 'About Us',
      slug: 'about-us',
      meta_title: 'About PhonesDaddy — Trusted Mobile Specifications & Prices',
      meta_description: 'Learn about PhonesDaddy, your go-to destination for authentic mobile specifications, price tracking, benchmarks, and honest smartphone comparisons.',
      show_in_footer: 1,
      status: 'published',
      content: `
        <h2>Welcome to PhonesDaddy</h2>
        <p><strong>PhonesDaddy</strong> is a premier tech portal dedicated to providing accurate, lightning-fast, and comprehensive mobile phone specifications, authentic market prices, side-by-side device comparisons, and timely tech news.</p>
        
        <h3>Our Mission</h3>
        <p>Our mission is simple: to empower smartphone buyers, tech enthusiasts, and everyday consumers with transparent and reliable technical data so they can make confident buying decisions.</p>
        
        <h3>What We Provide</h3>
        <ul>
          <li><strong>Authentic Specifications:</strong> Detailed hardware data covering displays, camera sensors, chipsets, battery charging rates, memory variants, and network bands.</li>
          <li><strong>Real-time Price Tracking:</strong> Updated retail and estimated market pricing across major brands including Samsung, Apple, Xiaomi, Vivo, Oppo, OnePlus, and more.</li>
          <li><strong>Side-by-Side Comparisons:</strong> Direct, multi-attribute phone comparison tools that pit flagship and budget devices head-to-head.</li>
          <li><strong>Editorial Tech News & Reviews:</strong> Genuine leaks, rumor roundups, launch event recaps, and unbiased community feedback.</li>
        </ul>

        <h3>Our Editorial Standards</h3>
        <p>Every piece of data published on PhonesDaddy undergoes thorough verification against official manufacturer documentation, benchmark suites, and validated testing protocols. We operate with editorial independence to serve our community first.</p>
      `
    },
    {
      title: 'Contact Us',
      slug: 'contact-us',
      meta_title: 'Contact PhonesDaddy — Editorial Inquiries & Feedback',
      meta_description: 'Have a question, feedback, or business inquiry? Get in touch with the PhonesDaddy team today.',
      show_in_footer: 1,
      status: 'published',
      content: `
        <h2>Get in Touch with PhonesDaddy</h2>
        <p>We value feedback, press releases, tips, advertising inquiries, and technical corrections from our readers and partners. Use the information below or our contact form to reach out to our team.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin: 24px 0;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
            <h4 style="margin-top: 0; color: #0d9488;">📬 General Inquiries</h4>
            <p style="margin: 6px 0; font-size: 14px; color: #475569;">For feedback, site issues, and general support:</p>
            <p style="margin: 0; font-weight: 700; color: #0f172a;">support@phonesdaddy.com</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
            <h4 style="margin-top: 0; color: #0d9488;">📢 Advertising & Partnerships</h4>
            <p style="margin: 6px 0; font-size: 14px; color: #475569;">Direct banner ads, sponsored reviews, and media kits:</p>
            <p style="margin: 0; font-weight: 700; color: #0f172a;">advertising@phonesdaddy.com</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
            <h4 style="margin-top: 0; color: #0d9488;">✍️ Editorial Tips & Leaks</h4>
            <p style="margin: 6px 0; font-size: 14px; color: #475569;">Got an exclusive scoop or correction to report?</p>
            <p style="margin: 0; font-weight: 700; color: #0f172a;">editorial@phonesdaddy.com</p>
          </div>
        </div>

        <h3>Response Time</h3>
        <p>Our editorial team typically responds to legitimate inquiries within 24 to 48 business hours.</p>
      `
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      meta_title: 'Privacy Policy — PhonesDaddy',
      meta_description: 'Read the PhonesDaddy privacy policy explaining how we collect, handle, and safeguard user data and cookies.',
      show_in_footer: 1,
      status: 'published',
      content: `
        <h2>Privacy Policy</h2>
        <p><em>Last Updated: September 2026</em></p>
        
        <p>At <strong>PhonesDaddy</strong> (accessible from https://phonesdaddy.com), your privacy is one of our main priorities. This Privacy Policy document outlines the types of information that is collected and recorded by PhonesDaddy and how we utilize it.</p>
        
        <h3>1. Information We Collect</h3>
        <p>We collect information in several ways when you visit our website:</p>
        <ul>
          <li><strong>Log Files:</strong> Like most websites, PhonesDaddy follows standard procedures using log files. This includes internet protocol (IP) addresses, browser types, Internet Service Providers (ISPs), date/time stamps, referring/exit pages, and click counts. These are not linked to personally identifiable information.</li>
          <li><strong>Cookies & Web Beacons:</strong> PhonesDaddy uses cookies to store information about visitors' preferences, to record user-specific information on which pages the visitor accesses, and to customize web page content based on browser type.</li>
          <li><strong>User Comments & Reviews:</strong> If you voluntarily submit a comment or review on a mobile phone or article, we store your name, email address (not publicly displayed), rating, and comment text.</li>
        </ul>

        <h3>2. Third-Party Advertisers and Analytics</h3>
        <p>We may partner with third-party ad networks (such as Google AdSense, Adsterra) and analytics providers (such as Google Analytics). These third parties may use cookies and web beacons in their ads and links that appear on PhonesDaddy. They automatically receive your IP address when this occurs. PhonesDaddy has no access to or control over these cookies used by third-party advertisers.</p>

        <h3>3. Data Security</h3>
        <p>We employ administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the data you provide to us, please be aware that no security measures are perfect or impenetrable.</p>

        <h3>4. Children's Information</h3>
        <p>PhonesDaddy does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, please contact us immediately and we will promptly remove such records.</p>
      `
    },
    {
      title: 'Disclaimer',
      slug: 'disclaimer',
      meta_title: 'Disclaimer — PhonesDaddy',
      meta_description: 'Important legal disclaimer regarding mobile phone specifications, pricing accuracy, and external links on PhonesDaddy.',
      show_in_footer: 1,
      status: 'published',
      content: `
        <h2>Website Disclaimer</h2>
        <p><em>Last Updated: September 2026</em></p>
        
        <p>The information provided by <strong>PhonesDaddy</strong> ("we", "us", or "our") on this website is for general informational purposes only. All information on the site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.</p>
        
        <h3>1. Mobile Phone Specifications & Prices</h3>
        <p>While we make every effort to ensure all specifications, features, and pricing details are 100% accurate, discrepancies may occur due to variations across regional markets, carrier-locked models, firmware revisions, or unannounced manufacturer changes. <strong>PhonesDaddy cannot guarantee that all specifications and prices are completely error-free.</strong> We strongly advise verifying specifications with the official manufacturer or authorized retailer before purchasing.</p>

        <h3>2. Rumors and Upcoming Devices</h3>
        <p>Pages marked as <em>"Rumored"</em> or <em>"Upcoming"</em> are based on industry leaks, benchmark appearances, regulatory filings, and speculative reporting. Actual released products may differ significantly from rumored data.</p>

        <h3>3. External Links Disclaimer</h3>
        <p>PhonesDaddy may contain links to external websites that are not provided or maintained by or in any way affiliated with us. Please note that PhonesDaddy does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.</p>

        <h3>4. Fair Use & Trademarks</h3>
        <p>All brand logos, smartphone model names, and registered trademarks displayed on PhonesDaddy are the intellectual property of their respective owners (e.g., Apple Inc., Samsung Electronics, Xiaomi Corporation, Google LLC). Their presence on this site is purely for identification, descriptive, and review purposes under Fair Use guidelines.</p>
      `
    }
  ];

  for (const p of defaultPages) {
    await pool.query(`
      INSERT INTO \`pages\` (title, slug, content, meta_title, meta_description, show_in_footer, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        meta_title = VALUES(meta_title),
        meta_description = VALUES(meta_description),
        show_in_footer = VALUES(show_in_footer)
    `, [p.title, p.slug, p.content, p.meta_title, p.meta_description, p.show_in_footer, p.status]);
  }
  console.log('Seeded default 4 pages (About Us, Contact Us, Privacy Policy, Disclaimer).');

  console.log('✅ Migration completed successfully!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});

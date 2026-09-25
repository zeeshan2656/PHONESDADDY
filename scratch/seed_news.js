const { pool } = require('../server/config/database');

async function updateSampleNews() {
  try {
    // Article 1: Samsung Galaxy S26 Ultra Leaks
    await pool.query(
      `UPDATE news SET
        summary = ?,
        author = ?,
        category = ?,
        is_hot = 1,
        status = 'published',
        image = ?,
        content = ?
      WHERE id = 1`,
      [
        'Early technical leaks around the Samsung Galaxy S26 Ultra reveal next-gen 200MP ISOCELL sensors paired with Qualcomm Snapdragon 8 Elite Gen 2 for unprecedented mobile imaging.',
        'Hamza Ali (Tech Editor)',
        'Leaks & Rumors',
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
        '<p>Industry insiders have leaked early engineering details of the upcoming <strong>Samsung Galaxy S26 Ultra</strong>, revealing that Samsung intends to deliver its most aggressive photographic hardware upgrade in four years.</p><h2><span style="color: #0d9488;">Next-Generation 200MP Sensor &amp; 3nm Snapdragon</span></h2><p>According to trusted supply-chain sources, the flagship will debut a custom-tuned <span style="color: #0d9488; font-weight: 700;">ISOCELL HP3 Gen 2 sensor</span> with a larger 1/1.12-inch physical footprint. Paired with <a href="https://www.qualcomm.com" target="_blank" rel="noopener">Qualcomm Snapdragon 8 Elite Gen 2</a>, computational photography latency will drop by over 40%.</p><blockquote><p>"Samsung is focusing heavily on variable aperture and periscope zoom stabilization for 8K video capture at 60fps without thermal throttling."</p></blockquote><h3><span style="color: #ea580c;">Key Leaked Technical Highlights:</span></h3><ul><li><strong>Processor:</strong> Qualcomm Snapdragon 8 Elite 2 (3nm TSMC N3E)</li><li><strong>Main Camera:</strong> 200 MP (OIS, f/1.6 - f/2.4 dual-step mechanical aperture)</li><li><strong>Display:</strong> 6.8-inch Dynamic AMOLED 2X, <span style="background-color: #fef3c7;">3200 nits peak brightness</span></li><li><strong>Battery:</strong> 5,500 mAh with 65W wired Fast Charging</li></ul><p>You can check existing models in our <a href="/brand/samsung">Samsung Mobile Catalog</a> or compare current flagships using our <a href="/compare">Phone Comparison Tool</a>.</p>'
      ]
    );

    // Article 2: Apple iOS 20 Intelligence
    await pool.query(
      `UPDATE news SET
        summary = ?,
        author = ?,
        category = ?,
        is_hot = 1,
        status = 'published',
        image = ?,
        content = ?
      WHERE id = 2`,
      [
        'Apple has officially previewed iOS 20 featuring cross-app generative actions, Siri 3.0, and deep on-device Apple Intelligence for modern iPhone devices.',
        'Sarah Jenkins',
        'Hot News',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
        '<p>At its Worldwide Developers Conference keynote, Apple demonstrated <strong style="color: #0f172a;">iOS 20</strong>, the most ambitious architectural overhaul to iOS in over a decade. Powered by Apple Foundation models running locally on the A18 and A19 Bionic neural engines, iOS 20 transforms how users interact with apps.</p><h2><span style="color: #0284c7;">Siri 3.0: Full Contextual Awareness</span></h2><p>Siri can now execute multi-step routines across third-party applications. For instance, you can ask Siri to <span style="background-color: #ccfbf1; color: #0f766e; font-weight: 600;">"Find the PDF invoice Ali sent me on WhatsApp and summarize the totals in Notes"</span>, and the action is processed entirely on-device without telemetry leakage.</p><h3>Supported iPhone Lineup:</h3><ul><li>iPhone 17 Pro and iPhone 17 Pro Max</li><li>iPhone 16 and 16 Pro Series</li><li>iPhone 15 Pro and 15 Pro Max</li></ul><p>Explore full iPhone specs and pricing in Pakistan on our <a href="/brand/apple">Apple iPhones Hub</a>.</p>'
      ]
    );

    // Article 3: 6000mAh Battery Tech
    await pool.query(
      `UPDATE news SET
        summary = ?,
        author = ?,
        category = ?,
        is_hot = 1,
        status = 'published',
        image = ?,
        content = ?
      WHERE id = 3`,
      [
        'Silicon-carbon anode technology is revolutionizing smartphone stamina in 2025 and 2026, enabling 6000mAh capacities in ultra-slim chassis.',
        'Editorial Team',
        'Buying Guides',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
        '<p>For years, smartphone thickness limited battery capacities to around 5,000mAh. But the rapid adoption of <strong style="color: #16a34a;">Silicon-Carbon (Si/C) anodes</strong> has boosted energy density by up to 22% without expanding phone dimensions.</p><h2><span style="color: #15803d;">Why Silicon Batteries Are the New Gold Standard</span></h2><p>Silicon can store significantly more lithium ions than conventional graphite. Manufacturers like <a href="/brand/vivo">Vivo</a>, <a href="/brand/xiaomi">Xiaomi</a>, and <a href="/brand/oppo">Oppo</a> are now deploying 6,000mAh to 6,500mAh batteries in devices under 8.2mm thin.</p><h3><span style="color: #ea580c;">Top Advantages:</span></h3><ol><li><strong>2-Day True Endurance:</strong> 9-11 hours of screen-on-time on heavy 5G usage.</li><li><strong>Cold Weather Resistance:</strong> Sub-zero performance drops by less than 8%.</li><li><strong>Faster Charging Cycles:</strong> Over 1,600 charge cycles before hitting 80% health.</li></ol><p>Browse our complete list of battery-centric devices in the <a href="/phones">Mobiles Catalog</a>.</p>'
      ]
    );

    console.log('✅ Successfully updated sample news articles with rich formatting!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating sample news:', err);
    process.exit(1);
  }
}

updateSampleNews();

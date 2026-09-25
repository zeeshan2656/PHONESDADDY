const fs = require('fs');
const html = fs.readFileSync('C:/Users/Basharat/.gemini/antigravity-ide/brain/d3c0c4c1-a5da-48f0-80b2-dc25342b53a5/scratch/wm_sample.html', 'utf8');

// Look for where Tecno Spark 8C text is in the HTML
const idx = html.indexOf('Tecno Spark 8C');
if (idx !== -1) {
  console.log('Found Tecno Spark 8C at index:', idx);
  // Find paragraphs or descriptions
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  let count = 0;
  while ((match = pRegex.exec(html)) !== null && count < 10) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text.length > 50) {
      console.log(`\n--- Paragraph ${count + 1} (${text.length} chars) ---`);
      console.log(text);
      count++;
    }
  }
}

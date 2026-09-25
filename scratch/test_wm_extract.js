const fs = require('fs');
const html = fs.readFileSync('C:/Users/Basharat/.gemini/antigravity-ide/brain/d3c0c4c1-a5da-48f0-80b2-dc25342b53a5/scratch/wm_sample.html', 'utf8');

function extractWhatMobileParagraph(html, fullName) {
  // Method 1: Find paragraphs containing "price in Pakistan is" or device name
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  const parts = [];

  while ((match = pRegex.exec(html)) !== null) {
    let clean = match[1]
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#x24;/g, '$')
      .replace(/&amp;/g, '&')
      .replace(/\r/g, '')
      .split('\n')
      .map(line => line.trim().replace(/\s+/g, ' '))
      .filter(line => line.length > 0)
      .join('\n');

    if (
      clean.includes('price in Pakistan is') ||
      clean.includes('Price of ') ||
      clean.includes('is unveiling') ||
      clean.includes('has released') ||
      clean.includes('equipped with') ||
      clean.includes('empowered by')
    ) {
      if (!clean.includes('Disclaimer') && !clean.includes('Mobile Prices in Pakistan')) {
        parts.push(clean);
      }
    }
  }

  return parts.join('\n\n');
}

console.log('--- Extracted WhatMobile Paragraph ---\n');
console.log(extractWhatMobileParagraph(html, 'Tecno Spark 8C'));

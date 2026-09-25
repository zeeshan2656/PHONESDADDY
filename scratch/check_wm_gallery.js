const fs = require('fs');

const wmHtml = fs.readFileSync('C:/Users/Basharat/.gemini/antigravity-ide/brain/d3c0c4c1-a5da-48f0-80b2-dc25342b53a5/scratch/wm_sample.html', 'utf8');

// Check all links or tabs in WhatMobile
const links = [...wmHtml.matchAll(/href=["']?([^"'\s>]+)/gi)].map(m => m[1]);
const picLinks = links.filter(l => l.includes('image') || l.includes('photo') || l.includes('picture') || l.includes('gallery'));
console.log('WM picture/gallery links:', picLinks);

// Check if any other images of Tecno Spark 8C exist on WhatMobile
const allImgs = [...wmHtml.matchAll(/src=["']?([^"'\s>]+)/gi)].map(m => m[1]);
const sparkImgs = allImgs.filter(i => i.toLowerCase().includes('spark8c') || i.toLowerCase().includes('spark-8c'));
console.log('Spark 8C images in HTML:', sparkImgs);

// Check if -b.jpg, -1.jpg, etc. might exist
console.log('Main image in WM HTML:', sparkImgs);

const path = require('path');
const fs = require('fs');
const SettingsModel = require('../models/settingsModel');

// 404 Not Found Handler
async function notFoundHandler(req, res, next) {
  res.status(404);

  // Respond with JSON if requested or is an API route
  if (req.path.startsWith('/api/') || req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
    return res.json({ success: false, message: 'Resource not found' });
  }

  // Otherwise serve 404 HTML page with custom head snippets
  try {
    const filePath = path.join(__dirname, '../../views/404.html');
    let html = fs.readFileSync(filePath, 'utf8');

    const headCode = await SettingsModel.getCombinedHeadCode();
    if (headCode && html.includes('</head>')) {
      html = html.replace('</head>', `\n<!-- Custom Head Snippets -->\n${headCode}\n</head>`);
    }

    const bodyCode = await SettingsModel.getCombinedBodyCode();
    if (bodyCode && html.includes('</body>')) {
      html = html.replace('</body>', `\n<!-- Custom Body Snippets -->\n${bodyCode}\n</body>`);
    }

    res.send(html);
  } catch (err) {
    res.sendFile(path.join(__dirname, '../../views/404.html'));
  }
}

// Global Error Handler
function errorHandler(err, req, res, next) {
  console.error('Server Error:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (req.path.startsWith('/api/') || req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  res.status(statusCode).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Error ${statusCode} - PhonesDaddy</title>
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body style="font-family: system-ui; text-align: center; padding: 60px 20px;">
      <h1 style="color: #0f172a; font-size: 2.5rem; margin-bottom: 12px;">Something went wrong</h1>
      <p style="color: #64748b; font-size: 1.1rem; margin-bottom: 24px;">${message}</p>
      <a href="/" style="display: inline-block; padding: 10px 20px; background: #0d9488; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600;">Return to Homepage</a>
    </body>
    </html>
  `);
}

module.exports = {
  notFoundHandler,
  errorHandler
};

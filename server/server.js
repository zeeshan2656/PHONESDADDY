const app = require('./app');
const { testConnection } = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  const dbOk = await testConnection();
  if (!dbOk) {
    console.error('⚠️ Warning: Failed to connect to MySQL database. Ensure MySQL daemon is running.');
  }

  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 PhonesDaddy Server is running on:`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`👉 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`=================================================`);
  });
}

startServer();

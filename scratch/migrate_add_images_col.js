const { pool } = require('../server/config/database');

async function migrate() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM phones LIKE 'images'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE phones ADD COLUMN images TEXT DEFAULT NULL AFTER image");
      console.log("Successfully added 'images' column to phones table");
    } else {
      console.log("'images' column already exists in phones table");
    }
  } catch (err) {
    console.error("Migration error:", err.message);
  } finally {
    process.exit(0);
  }
}

migrate();

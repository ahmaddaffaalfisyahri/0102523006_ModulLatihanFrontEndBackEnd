const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function seedUser() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'kampus'
    });
    
    console.log("Connected to database 'kampus'");
    
    const email = 'admin@example.com';
    const password = 'password123';
    const name = 'Admin Ahmad Daffa';
    const role = 'admin';
    
    // Check if user already exists
    const [rows] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      console.log("User already exists, updating password...");
      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.query('UPDATE users SET password = ?, name = ? WHERE email = ?', [hashedPassword, name, email]);
      console.log("User password updated.");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role]);
      console.log("User admin@example.com seeded successfully with password: password123");
    }
    
    await connection.end();
  } catch (err) {
    console.error("Error seeding user:", err);
  }
}

seedUser();

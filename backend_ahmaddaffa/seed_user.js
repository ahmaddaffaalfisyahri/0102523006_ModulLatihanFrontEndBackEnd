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
    
    const usersToSeed = [
      { name: 'Admin Ahmad Daffa', email: 'admin@example.com', password: 'password123', role: 'admin' },
      { name: 'Operator Ahmad Daffa', email: 'operator@example.com', password: 'password123', role: 'operator' },
      { name: 'Viewer Ahmad Daffa', email: 'viewer@example.com', password: 'password123', role: 'viewer' }
    ];

    for (const u of usersToSeed) {
      const [rows] = await connection.query('SELECT id FROM users WHERE email = ?', [u.email]);
      const hashedPassword = await bcrypt.hash(u.password, 10);
      
      if (rows.length > 0) {
        console.log(`User ${u.email} already exists, updating...`);
        await connection.query(
          'UPDATE users SET name = ?, password = ?, role = ? WHERE email = ?', 
          [u.name, hashedPassword, u.role, u.email]
        );
        console.log(`User ${u.email} updated.`);
      } else {
        await connection.query(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', 
          [u.name, u.email, hashedPassword, u.role]
        );
        console.log(`User ${u.email} seeded successfully.`);
      }
    }
    
    await connection.end();
  } catch (err) {
    console.error("Error seeding users:", err);
  }
}

seedUser();

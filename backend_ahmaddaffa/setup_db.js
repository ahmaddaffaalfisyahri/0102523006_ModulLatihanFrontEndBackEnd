const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDB() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      multipleStatements: true
    });
    
    console.log("Connected to MySQL");
    
    const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
    
    await connection.query(sql);
    console.log("Database and tables created successfully.");
    
    await connection.end();
  } catch (err) {
    console.error("Error setting up DB:", err);
  }
}

setupDB();

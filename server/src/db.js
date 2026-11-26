const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'professor',
  password: process.env.DB_PASSWORD || '012345678',
  database: process.env.DB_NAME || 'adad',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true
});

module.exports = pool;

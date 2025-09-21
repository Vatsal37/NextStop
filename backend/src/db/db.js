// backend/db.js
import mysql from 'mysql2';

let db;

const connectDB = async () => {
  try {
    db = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    await db.connect();
    console.log('Connected to MySQL');
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
};

// Export both the connection function and the db instance
export default connectDB;
export { db };

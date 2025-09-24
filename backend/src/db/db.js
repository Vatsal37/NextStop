import mysql from 'mysql2/promise';

let pool;

const connectDB = async () => {
  try {
    if (!pool) {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    }
    // Test a connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('MySQL pool is ready');
  } catch (err) {
    console.error('MySQL pool initialization failed:', err);
    throw err;
  }
};

export default connectDB;
export { pool };

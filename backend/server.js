// backend/index.js
import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();

app.use(cors());
app.use(express.json());

// Sample route to fetch users
app.get('/api/users', (req, res) => {
  const query = 'SELECT * FROM trip'; // Replace with your actual table
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

// Test route
app.get('/', (req, res) => {
  res.send('API is working');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

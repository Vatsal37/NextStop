import dotenv from 'dotenv';
import { app } from './app.js';
import connectDB, { db } from './db/db.js';

dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MySQL connection failed !!! ", err);
    process.exit(1);
})

// app.get('/api/users', (req, res) => {
//     const query = 'SELECT * FROM trip'; // Replace with your actual table
//     db.query(query, (err, results) => {
//       if (err) {
//         console.error('Database error:', err);
//         return res.status(500).json({ error: 'Internal server error' });
//       }
//       res.json(results);
//     });
//   });

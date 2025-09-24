import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const { app } = await import('./app.js');
const { default: connectDB } = await import('./db/db.js');

connectDB()
    .then(() => {
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
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

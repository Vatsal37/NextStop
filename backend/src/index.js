import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setIO } from './utils/realtime.js';

dotenv.config({ path: './.env' });

const { app } = await import('./app.js');
const { default: connectDB } = await import('./db/db.js');
const { cleanupExpiredOTPs } = await import('./models/otp.model.js');

connectDB()
    .then(() => {
        const port = process.env.PORT || 5000;
        const server = http.createServer(app);
        const io = new SocketIOServer(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        setIO(io);
        io.on('connection', () => {});
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

        // Clean up expired OTPs on server restart
        // Expired OTPs are already rejected during verification (expires_at > NOW()),
        // this cleanup just removes old expired entries from the database
        cleanupExpiredOTPs()
            .then((deletedCount) => {
                if (deletedCount > 0) {
                    console.log(`[OTP Cleanup] Deleted ${deletedCount} expired OTP(s) on server start`);
                }
            })
            .catch((error) => {
                console.error('[OTP Cleanup] Error cleaning up expired OTPs:', error);
            });
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

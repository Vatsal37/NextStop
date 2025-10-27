import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import connectDB, { pool } from './src/db/db.js';

async function checkDatabaseStatus() {
    await connectDB();
    const conn = await pool.getConnection();
    
    try {
        console.log('🔍 Checking database status after network issue...\n');
        
        // Check total schedules
        const [totalCount] = await conn.query(
            'SELECT COUNT(*) as count FROM flight_schedules WHERE is_active = 1'
        );
        
        // Check DAILY schedules
        const [dailyCount] = await conn.query(
            'SELECT COUNT(*) as count FROM flight_schedules WHERE frequency = "DAILY" AND is_active = 1'
        );
        
        // Get frequency distribution
        const [distribution] = await conn.query(
            'SELECT frequency, COUNT(*) as count FROM flight_schedules WHERE is_active = 1 GROUP BY frequency ORDER BY frequency'
        );
        
        // Get sample records
        const [sampleRecords] = await conn.query(
            `SELECT fs.flight_number, fs.frequency, a.airline_code, fs.departure_time
             FROM flight_schedules fs
             JOIN airlines a ON fs.airline_id = a.airline_id
             WHERE fs.is_active = 1
             ORDER BY fs.schedule_id DESC
             LIMIT 5`
        );
        
        console.log('📊 Current Database Status:');
        console.log(`Total active schedules: ${totalCount[0].count}`);
        console.log(`DAILY schedules remaining: ${dailyCount[0].count}`);
        
        console.log('\n📈 Frequency Distribution:');
        distribution.forEach(row => {
            console.log(`  ${row.frequency}: ${row.count} schedules`);
        });
        
        console.log('\n🔍 Sample Records:');
        sampleRecords.forEach(record => {
            console.log(`  ${record.airline_code}${record.flight_number} - ${record.frequency} at ${record.departure_time}`);
        });
        
        if (dailyCount[0].count > 0) {
            console.log('\n⚠️  There are still DAILY schedules that need to be updated.');
            console.log('💡 You can run the update script to convert them to weekdays.');
        } else {
            console.log('\n✅ All DAILY schedules have been successfully converted to weekdays!');
        }
        
    } catch (error) {
        console.error('❌ Error checking database status:', error);
    } finally {
        conn.release();
        process.exit(0);
    }
}

checkDatabaseStatus();


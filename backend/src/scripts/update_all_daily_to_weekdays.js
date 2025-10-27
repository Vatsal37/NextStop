import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import connectDB, { pool } from '../db/db.js';

// This script updates ALL DAILY frequency records to random weekdays
// Each DAILY schedule will be converted to a single random weekday (MON-SUN)

const WEEKDAYS = [
    'WEEKLY_MON',
    'WEEKLY_TUE', 
    'WEEKLY_WED',
    'WEEKLY_THU',
    'WEEKLY_FRI',
    'WEEKLY_SAT',
    'WEEKLY_SUN'
];

// Function to get random weekday
const getRandomWeekday = () => {
    return WEEKDAYS[Math.floor(Math.random() * WEEKDAYS.length)];
};

async function updateAllDailyToWeekdays() {
    await connectDB();
    const conn = await pool.getConnection();
    
    try {
        await conn.beginTransaction();
        
        // First, let's see how many DAILY records we have
        const [dailyCount] = await conn.query(
            `SELECT COUNT(*) as count FROM flight_schedules WHERE frequency = 'DAILY' AND is_active = 1`
        );
        
        console.log(`Found ${dailyCount[0].count} DAILY frequency records to update`);
        
        if (dailyCount[0].count === 0) {
            console.log('No DAILY records found. Nothing to update.');
            await conn.commit();
            return;
        }
        
        // Get all DAILY schedules
        const [dailySchedules] = await conn.query(
            `SELECT schedule_id, airline_id, route_id, aircraft_id, flight_number, 
                    departure_time, arrival_time, valid_from, valid_until
             FROM flight_schedules 
             WHERE frequency = 'DAILY' AND is_active = 1`
        );
        
        console.log(`Processing ${dailySchedules.length} DAILY schedules...`);
        
        let updatedCount = 0;
        
        for (const schedule of dailySchedules) {
            // Generate a random weekday for this schedule
            const randomWeekday = getRandomWeekday();
            
            // Update the frequency to the random weekday
            await conn.execute(
                `UPDATE flight_schedules 
                 SET frequency = ? 
                 WHERE schedule_id = ?`,
                [randomWeekday, schedule.schedule_id]
            );
            
            updatedCount++;
            console.log(`Updated schedule ${schedule.schedule_id} (${schedule.flight_number}) to ${randomWeekday}`);
        }
        
        await conn.commit();
        console.log(`\n✅ Successfully updated ${updatedCount} DAILY schedules to random weekdays`);
        
        // Show summary of the distribution
        const [distribution] = await conn.query(
            `SELECT frequency, COUNT(*) as count 
             FROM flight_schedules 
             WHERE is_active = 1 
             GROUP BY frequency 
             ORDER BY frequency`
        );
        
        console.log('\n📊 Current frequency distribution:');
        distribution.forEach(row => {
            console.log(`  ${row.frequency}: ${row.count} schedules`);
        });
        
    } catch (error) {
        await conn.rollback();
        console.error('❌ Update failed:', error);
        throw error;
    } finally {
        conn.release();
        process.exit(0);
    }
}

// Run the update
updateAllDailyToWeekdays().catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
});


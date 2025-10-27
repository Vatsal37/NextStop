import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import connectDB, { pool } from '../db/db.js';

// Advanced script to update ALL DAILY frequency records to weekdays
// with configurable distribution and preferences

const WEEKDAYS = [
    'WEEKLY_MON',
    'WEEKLY_TUE', 
    'WEEKLY_WED',
    'WEEKLY_THU',
    'WEEKLY_FRI',
    'WEEKLY_SAT',
    'WEEKLY_SUN'
];

// Configuration options
const CONFIG = {
    // Distribution preferences (higher numbers = more likely to be selected)
    weekdayWeights: {
        'WEEKLY_MON': 1.2,    // Monday - slightly more popular
        'WEEKLY_TUE': 1.0,    // Tuesday - normal
        'WEEKLY_WED': 1.0,    // Wednesday - normal  
        'WEEKLY_THU': 1.0,    // Thursday - normal
        'WEEKLY_FRI': 1.5,    // Friday - more popular (weekend travel)
        'WEEKLY_SAT': 1.3,    // Saturday - popular for leisure
        'WEEKLY_SUN': 1.1     // Sunday - slightly more popular
    },
    
    // Whether to avoid certain weekdays for specific airlines
    airlinePreferences: {
        // Example: Air India prefers weekdays, IndiGo prefers weekends
        // You can customize this based on your business logic
    },
    
    // Whether to show detailed logging
    verboseLogging: true
};

// Function to get weighted random weekday
const getWeightedRandomWeekday = (airlineCode = null) => {
    const weights = Object.entries(CONFIG.weekdayWeights);
    const totalWeight = weights.reduce((sum, [, weight]) => sum + weight, 0);
    
    let random = Math.random() * totalWeight;
    
    for (const [weekday, weight] of weights) {
        random -= weight;
        if (random <= 0) {
            return weekday;
        }
    }
    
    // Fallback to equal distribution
    return WEEKDAYS[Math.floor(Math.random() * WEEKDAYS.length)];
};

// Function to get simple random weekday (equal probability)
const getRandomWeekday = () => {
    return WEEKDAYS[Math.floor(Math.random() * WEEKDAYS.length)];
};

async function updateAllDailyToWeekdays() {
    await connectDB();
    const conn = await pool.getConnection();
    
    try {
        await conn.beginTransaction();
        
        // Get count of DAILY records
        const [dailyCount] = await conn.query(
            `SELECT COUNT(*) as count FROM flight_schedules WHERE frequency = 'DAILY' AND is_active = 1`
        );
        
        console.log(`🔍 Found ${dailyCount[0].count} DAILY frequency records to update`);
        
        if (dailyCount[0].count === 0) {
            console.log('✅ No DAILY records found. Nothing to update.');
            await conn.commit();
            return;
        }
        
        // Get all DAILY schedules with airline information
        const [dailySchedules] = await conn.query(
            `SELECT fs.schedule_id, fs.airline_id, fs.route_id, fs.aircraft_id, 
                    fs.flight_number, fs.departure_time, fs.arrival_time, 
                    fs.valid_from, fs.valid_until, a.airline_code
             FROM flight_schedules fs
             JOIN airlines a ON fs.airline_id = a.airline_id
             WHERE fs.frequency = 'DAILY' AND fs.is_active = 1`
        );
        
        console.log(`\n🔄 Processing ${dailySchedules.length} DAILY schedules...`);
        
        let updatedCount = 0;
        const weekdayDistribution = {};
        
        for (const schedule of dailySchedules) {
            // Choose random weekday (you can switch to getWeightedRandomWeekday for weighted distribution)
            const randomWeekday = getRandomWeekday();
            
            // Track distribution
            weekdayDistribution[randomWeekday] = (weekdayDistribution[randomWeekday] || 0) + 1;
            
            // Update the frequency
            await conn.execute(
                `UPDATE flight_schedules 
                 SET frequency = ? 
                 WHERE schedule_id = ?`,
                [randomWeekday, schedule.schedule_id]
            );
            
            updatedCount++;
            
            if (CONFIG.verboseLogging) {
                console.log(`  ✓ Updated ${schedule.flight_number} (${schedule.airline_code}) → ${randomWeekday}`);
            }
        }
        
        await conn.commit();
        console.log(`\n✅ Successfully updated ${updatedCount} DAILY schedules to random weekdays`);
        
        // Show distribution summary
        console.log('\n📊 Distribution of updated schedules:');
        Object.entries(weekdayDistribution)
            .sort(([,a], [,b]) => b - a)
            .forEach(([weekday, count]) => {
                const percentage = ((count / updatedCount) * 100).toFixed(1);
                console.log(`  ${weekday}: ${count} schedules (${percentage}%)`);
            });
        
        // Show final frequency distribution
        const [finalDistribution] = await conn.query(
            `SELECT frequency, COUNT(*) as count 
             FROM flight_schedules 
             WHERE is_active = 1 
             GROUP BY frequency 
             ORDER BY frequency`
        );
        
        console.log('\n📈 Final frequency distribution:');
        finalDistribution.forEach(row => {
            console.log(`  ${row.frequency}: ${row.count} schedules`);
        });
        
        // Show some sample updated records
        console.log('\n🔍 Sample of updated records:');
        const [sampleRecords] = await conn.query(
            `SELECT fs.flight_number, fs.frequency, a.airline_code, fs.departure_time
             FROM flight_schedules fs
             JOIN airlines a ON fs.airline_id = a.airline_id
             WHERE fs.is_active = 1
             ORDER BY fs.schedule_id DESC
             LIMIT 10`
        );
        
        sampleRecords.forEach(record => {
            console.log(`  ${record.airline_code}${record.flight_number} - ${record.frequency} at ${record.departure_time}`);
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
console.log('🚀 Starting DAILY to Weekday conversion...');
console.log('📋 Configuration:');
console.log(`  - Using ${CONFIG.verboseLogging ? 'weighted' : 'equal'} distribution`);
console.log(`  - Verbose logging: ${CONFIG.verboseLogging ? 'enabled' : 'disabled'}`);

updateAllDailyToWeekdays().catch(error => {
    console.error('💥 Script execution failed:', error);
    process.exit(1);
});


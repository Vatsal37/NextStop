#!/usr/bin/env node

// Simple runner script for updating DAILY schedules to weekdays
// Usage: node update_daily_schedules.js [simple|advanced]

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const scriptType = process.argv[2] || 'simple';

async function runUpdateScript() {
    try {
        console.log('🔄 Updating DAILY flight schedules to weekdays...\n');
        
        let scriptPath;
        if (scriptType === 'advanced') {
            scriptPath = './src/scripts/update_all_daily_to_weekdays_advanced.js';
            console.log('📊 Using advanced script with weighted distribution');
        } else {
            scriptPath = './src/scripts/update_all_daily_to_weekdays.js';
            console.log('🎲 Using simple script with equal distribution');
        }
        
        const { stdout, stderr } = await execAsync(`node ${scriptPath}`);
        
        if (stdout) {
            console.log(stdout);
        }
        if (stderr) {
            console.error(stderr);
        }
        
        console.log('\n✅ Update completed successfully!');
        
    } catch (error) {
        console.error('❌ Error running update script:', error.message);
        process.exit(1);
    }
}

// Show usage information
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
📋 DAILY Schedule Update Script

Usage:
  node update_daily_schedules.js [simple|advanced]

Options:
  simple     Use simple equal distribution (default)
  advanced   Use advanced weighted distribution
  --help     Show this help message

Examples:
  node update_daily_schedules.js
  node update_daily_schedules.js simple
  node update_daily_schedules.js advanced

Description:
  This script updates all flight schedules with DAILY frequency
  to random weekdays (MON-SUN). The simple version uses equal
  probability for each weekday, while the advanced version uses
  weighted distribution based on travel patterns.
`);
    process.exit(0);
}

runUpdateScript();


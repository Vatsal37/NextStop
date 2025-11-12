import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory (two levels up from scripts)
dotenv.config({ path: join(__dirname, '../../.env') });

import connectDB, { pool } from '../db/db.js';
import { readFileSync } from 'fs';

async function runMigration() {
	try {
		console.log('🔄 Connecting to database...');
		await connectDB();
		
		const conn = await pool.getConnection();
		try {
			console.log('📄 Reading migration file...');
			const migrationSQL = readFileSync(
				join(__dirname, '../migrations/add_email_verification.sql'),
				'utf-8'
			);
			
			// Split by semicolon and filter out empty statements and comments
			const statements = migrationSQL
				.split(';')
				.map(s => s.trim())
				.filter(s => {
					// Remove comment lines
					const lines = s.split('\n').map(line => line.trim());
					const codeLines = lines.filter(line => line.length > 0 && !line.startsWith('--'));
					return codeLines.length > 0;
				})
				.map(s => {
					// Remove comment lines from statement
					return s.split('\n')
						.filter(line => {
							const trimmed = line.trim();
							return trimmed.length > 0 && !trimmed.startsWith('--');
						})
						.join('\n')
						.trim();
				})
				.filter(s => s.length > 0);
			
			console.log(`📝 Executing ${statements.length} SQL statement(s)...\n`);
			
			for (let i = 0; i < statements.length; i++) {
				const statement = statements[i];
				console.log(`Executing statement ${i + 1}/${statements.length}...`);
				console.log(statement.substring(0, 80) + '...\n');
				
				try {
					await conn.execute(statement);
					console.log(`✅ Statement ${i + 1} executed successfully\n`);
				} catch (error) {
					// Check if it's a "duplicate column" or "table already exists" error
					if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_TABLE_EXISTS_ERROR') {
						console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${error.message}\n`);
					} else {
						throw error;
					}
				}
			}
			
			console.log('✅ Migration completed successfully!');
			console.log('\n📋 Summary:');
			console.log('   - Added email_verified column to users table');
			console.log('   - Created email_otps table');
			console.log('\n💡 Note: Existing users will have email_verified = FALSE');
			console.log('   They will need to verify their email before logging in.');
			
		} catch (error) {
			console.error('❌ Migration failed:', error.message);
			console.error(error);
			process.exit(1);
		} finally {
			conn.release();
		}
	} catch (error) {
		console.error('❌ Database connection failed:', error.message);
		console.error('Make sure your .env file has correct database credentials.');
		process.exit(1);
	} finally {
		process.exit(0);
	}
}

runMigration();


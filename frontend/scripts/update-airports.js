import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_BACKEND_URL = process.env.VITE_API_URL || 'http://localhost:5000';
const BACKEND_URL = RAW_BACKEND_URL.trim().replace(/\/+$/, '');
const AIRPORTS_ENDPOINT = `${BACKEND_URL}/api/v1/airports`;
const OUTPUT_FILE = path.join(__dirname, '../src/data/airports.json');

async function updateAirports() {
  try {
    console.log('Fetching airports from backend...');
    console.log(`Endpoint: ${AIRPORTS_ENDPOINT}`);
    
    const response = await fetch(AIRPORTS_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const airports = result.data || [];

    console.log(`Fetched ${airports.length} airports`);

    // Format airports data to match the existing structure
    const formattedAirports = airports.map(airport => ({
      airport_code: airport.airport_code,
      city: airport.city,
      country: airport.country
    }));

    // Write to JSON file with proper formatting
    fs.writeFileSync(
      OUTPUT_FILE,
      JSON.stringify(formattedAirports, null, 2),
      'utf8'
    );

    console.log(`✅ Successfully updated ${OUTPUT_FILE}`);
    console.log(`   Total airports: ${formattedAirports.length}`);
  } catch (error) {
    console.error('❌ Error updating airports:', error.message);
    console.error('\nPlease ensure:');
    console.error('1. Backend server is running');
    console.error('2. Backend URL is correct (check VITE_API_URL env variable)');
    process.exit(1);
  }
}

updateAirports();


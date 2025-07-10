import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_TOKEN = 'h7H9Zod4oZaXXNHJos0xtgyHIAiausc77l3vlUZMTVAc1R2winuhaWUsYuyi';
const BASE_URL = 'https://api.sportmonks.com/v3/odds/markets';
const MARKETS_FILE_PATH = path.join(__dirname, 'src/constants/markets.json');

/**
 * Fetches all markets from SportMonks API and stores them in markets.json
 * The data is stored as an object with market IDs as keys for easy lookup
 */
async function fetchAllMarkets() {
    try {
        console.log('Starting to fetch all markets from SportMonks API...');
        
        let allMarkets = {};
        let currentPage = 1;
        let hasMore = true;
        
        while (hasMore) {
            console.log(`Fetching page ${currentPage}...`);
            
            const url = `${BASE_URL}?page=${currentPage}&api_token=${API_TOKEN}&per_page=50`;
            
            const response = await axios.get(url);
            const data = response.data;
            
            if (!data.data || !Array.isArray(data.data)) {
                console.error('Invalid response format:', data);
                break;
            }
            
            // Convert array to object with market ID as key
            data.data.forEach(market => {
                allMarkets[market.id] = {
                    id: market.id,
                    legacy_id: market.legacy_id,
                    name: market.name,
                    developer_name: market.developer_name,
                    has_winning_calculations: market.has_winning_calculations
                };
            });
            
            console.log(`Page ${currentPage}: Fetched ${data.data.length} markets`);
            
            // Check pagination
            if (data.pagination) {
                hasMore = data.pagination.has_more && data.pagination.next_page !== null;
                currentPage = data.pagination.next_page || currentPage + 1;
            } else {
                hasMore = false;
            }
            
            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Create the final structure
        const marketsData = {
            markets: allMarkets,
            total_count: Object.keys(allMarkets).length,
            last_updated: new Date().toISOString()
        };
        
        // Write to file
        fs.writeFileSync(MARKETS_FILE_PATH, JSON.stringify(marketsData, null, 2));
        
        console.log(`Successfully fetched and stored ${Object.keys(allMarkets).length} markets in ${MARKETS_FILE_PATH}`);
        
        return marketsData;
        
    } catch (error) {
        console.error('Error fetching markets:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
}

// Run the script
fetchAllMarkets()
    .then(() => {
        console.log('Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_TOKEN = 'h7H9Zod4oZaXXNHJos0xtgyHIAiausc77l3vlUZMTVAc1R2winuhaWUsYuyi';
const BASE_URL = 'https://api.sportmonks.com/v3/core/types';
const TYPES_FILE_PATH = path.join(__dirname, 'src/constants/types.json');

/**
 * Fetches all types from SportMonks API and stores them in types.json
 * The data is stored as an object with type IDs as keys for easy lookup
 */
async function fetchAllTypes() {
    try {
        console.log('Starting to fetch all types from SportMonks API...');
        
        let allTypes = {};
        let currentPage = 1;
        let hasMore = true;
        
        while (hasMore) {
            console.log(`Fetching page ${currentPage}...`);
            
            const url = `${BASE_URL}/?api_token=${API_TOKEN}&per_page=50&page=${currentPage}`;
            
            const response = await axios.get(url);
            const data = response.data;
            
            if (!data.data || !Array.isArray(data.data)) {
                console.error('Invalid response format:', data);
                break;
            }
            
            // Convert array to object with type ID as key
            data.data.forEach(type => {
                allTypes[type.id] = {
                    id: type.id,
                    name: type.name,
                    code: type.code,
                    developer_name: type.developer_name,
                    model_type: type.model_type,
                    stat_group: type.stat_group
                };
            });
            
            console.log(`Page ${currentPage}: Fetched ${data.data.length} types`);
            
            // Check pagination
            if (data.pagination) {
                hasMore = data.pagination.has_more && data.pagination.next_page !== null;
                currentPage = data.pagination.next_page ? 
                    new URL(data.pagination.next_page).searchParams.get('page') || currentPage + 1 : 
                    currentPage + 1;
            } else {
                hasMore = false;
            }
            
            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Create the final structure
        const typesData = {
            types: allTypes,
            total_count: Object.keys(allTypes).length,
            last_updated: new Date().toISOString()
        };
        
        // Write to file
        fs.writeFileSync(TYPES_FILE_PATH, JSON.stringify(typesData, null, 2));
        
        console.log(`Successfully fetched and stored ${Object.keys(allTypes).length} types in ${TYPES_FILE_PATH}`);
        
        return typesData;
        
    } catch (error) {
        console.error('Error fetching types:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
}

// Run the script
fetchAllTypes()
    .then(() => {
        console.log('Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 
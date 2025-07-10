import axios from 'axios';

const API_TOKEN = 'h7H9Zod4oZaXXNHJos0xtgyHIAiausc77l3vlUZMTVAc1R2winuhaWUsYuyi';
const FIXTURE_ID = '19391004';
const BASE_URL = 'https://api.sportmonks.com/v3/football/fixtures';

/**
 * Fetches fixture odds data and extracts only distinct labels and names
 */
async function extractDistinctOdds() {
    try {
        console.log(`Fetching odds data for fixture ${FIXTURE_ID}...`);
        
        const url = `${BASE_URL}/${FIXTURE_ID}?api_token=${API_TOKEN}&include=odds`;
        
        const response = await axios.get(url);
        const data = response.data;
        
        if (!data.data || !data.data.odds) {
            console.error('No odds data found in response');
            return;
        }
        
        const odds = data.data.odds;
        console.log(`Found ${odds.length} odds in the response`);
        
        // Extract distinct labels and names
        const distinctLabels = new Set();
        const distinctNames = new Set();
        
        odds.forEach(odd => {
            // Add distinct labels
            if (odd.label) {
                distinctLabels.add(odd.label);
            }
            
            // Add distinct names
            if (odd.name) {
                distinctNames.add(odd.name);
            }
        });
        
        // Convert Sets to Arrays and sort them
        const labelsArray = Array.from(distinctLabels).sort();
        const namesArray = Array.from(distinctNames).sort();
        
        // Create the result object
        const result = {
            fixture_id: FIXTURE_ID,
            total_odds: odds.length,
            distinct_labels: labelsArray,
            distinct_names: namesArray,
            labels_count: labelsArray.length,
            names_count: namesArray.length,
            extracted_at: new Date().toISOString()
        };
        
        console.log('\n=== EXTRACTION RESULTS ===');
        console.log(`Fixture ID: ${FIXTURE_ID}`);
        console.log(`Total odds found: ${odds.length}`);
        console.log(`Distinct labels: ${labelsArray.length}`);
        console.log(`Distinct names: ${namesArray.length}`);
        
        console.log('\n=== DISTINCT LABELS ===');
        labelsArray.forEach((label, index) => {
            console.log(`${index + 1}. ${label}`);
        });
        
        console.log('\n=== DISTINCT NAMES ===');
        namesArray.forEach((name, index) => {
            console.log(`${index + 1}. ${name}`);
        });
        
        console.log('\n=== RESULT OBJECT ===');
        console.log(JSON.stringify(result, null, 2));
        
        return result;
        
    } catch (error) {
        console.error('Error extracting odds data:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
}

// Run the script
extractDistinctOdds()
    .then(() => {
        console.log('\nScript completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 
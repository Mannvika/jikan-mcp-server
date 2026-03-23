// src/test-jikan.ts
import { searchAnime, getAnimeRelations, getAnimeDetails } from '../services/jikan-client.js';

async function runTests() {
    console.log("Starting Jikan API Tests...\n");

    try {
        // Test 1: Search for a franchise
        console.log("--- Test 1: searchAnime('Attack on Titan') ---");
        const searchResult = await searchAnime("Attack on Titan");
        
        if (!searchResult || !searchResult.data || searchResult.data.length === 0) {
            console.log("Search returned no results. Exiting.");
            return;
        }
        const firstAnime = searchResult.data[0]!;
        console.log(`Success! Found: ${firstAnime.title} (MAL ID: ${firstAnime.mal_id})`);

        // Test 2: Fetch Relations
        console.log(`\n--- Test 2: getAnimeRelations(${firstAnime.mal_id}) ---`);
        const relations = await getAnimeRelations(firstAnime.mal_id);
        console.log(`Success! Found ${relations.data.length} relation categories.`);
        if (relations.data.length > 0) {
            // Print the first relation nicely formatted
            console.log(JSON.stringify(relations.data[0], null, 2)); 
        }

        // Test 3: Fetch Full Details (for sorting/synopsis)
        console.log(`\n--- Test 3: getAnimeDetails(${firstAnime.mal_id}) ---`);
        const fullDetails = await getAnimeDetails(firstAnime.mal_id);
        console.log(`Success!`);
        console.log(`Aired from: ${fullDetails.data.aired?.from}`);
        console.log(`Synopsis preview: ${fullDetails.data.synopsis?.substring(0, 75)}...`);

        console.log("\n✅ All tests completed successfully!");

    } catch (error) {
        console.error("\n❌ Test failed with an error:", error);
    }
}

// Execute the function
runTests();
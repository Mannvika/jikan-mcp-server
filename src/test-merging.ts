// src/test-jikan.ts
import { handleMergeFranchise } from './tools/merge-franchise.js';

async function runTests() {
    console.log("==========================================");
    console.log("   Starting Jikan MCP Franchise Merger    ");
    console.log("==========================================\n");

    // "Steins;Gate", "Attack on Titan", or "Fate/stay night" are great test 
    // subjects because they have highly interconnected relation graphs.
    const testQuery = "Attack on Titan"; 

    try {
        // Execute the tool
        const result = await handleMergeFranchise(testQuery);

        console.log("\n==========================================");
        console.log("            FINAL MERGED RESULT           ");
        console.log("==========================================\n");

        if (result) {
            // Print the final, merged, and sorted JSON object
            console.log(JSON.stringify(result, null, 2));
            console.log(`\n✅ Successfully merged ${result.total_entries} entries for ${result.franchise_name}!`);
        } else {
            console.log("❌ No franchise data could be merged.");
        }

    } catch (error) {
        console.error("\n❌ Test failed with a fatal error:", error);
    }
}

// Execute the test
runTests();
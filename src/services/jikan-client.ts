import type {
    AnimeDetails,
    JikanAnimeResponse,
    JikanSearchResponse,
    JikanRelationResponse,
    Relation
} from "../types/jikan.js";

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4'
export const RATE_LIMIT_DELAY_MS = 750; 

let lastRequestTime = 0;

async function sleep(ms: number) : Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function rateLimit() {
    const timeSinceLastRequest = Date.now() - lastRequestTime;
    console.error(`Time since last request: ${timeSinceLastRequest}ms`);

    if (timeSinceLastRequest < RATE_LIMIT_DELAY_MS) {
        await sleep(RATE_LIMIT_DELAY_MS - timeSinceLastRequest);
    }
    
    lastRequestTime = Date.now();
}

async function fetchWithRateLimit<T>(endpoint: string, retries = 3): Promise<T> {
    for (let i = 0; i < retries; i++) {
        await rateLimit();
        const response = await fetch(`${JIKAN_BASE_URL}/${endpoint}`);
        
        if (response.ok) {
            return response.json() as Promise<T>;
        }
        
        if (response.status === 429) {
            console.error(`[Rate Limited] Pausing for 2 seconds before retrying /${endpoint}...`);
            await sleep(2000);
            continue; 
        }
        
        throw new Error(`Jikan API Error: ${response.status} on /${endpoint}`);
    }
    
    throw new Error(`Failed to fetch /${endpoint} after ${retries} retries.`);
}

export async function searchAnime(query: string): Promise<JikanSearchResponse> {
    // We add order_by=members&sort=desc so the most popular entry (the main show) is ALWAYS data[0]
    const url = `anime?q=${encodeURIComponent(query)}&order_by=members&sort=desc`;
    const response = await fetchWithRateLimit<JikanSearchResponse>(url);
    return response;
}

export async function getAnimeDetails(malId: number): Promise<JikanAnimeResponse> {
    const response = await fetchWithRateLimit<JikanAnimeResponse >(`anime/${malId}`);
    return response;
}

export async function getMangaRelations(malId: number): Promise<JikanRelationResponse> {
    const response = await fetchWithRateLimit<JikanRelationResponse>(`manga/${malId}/relations`);
    return response;
}

export async function getAnimeRelations(malId: number): Promise<JikanRelationResponse> {
    const response = await fetchWithRateLimit<JikanRelationResponse>(`anime/${malId}/relations`);
    return response;
}




import type {
    AnimeDetails,
    JikanAnimeResponse,
    JikanSearchResponse,
    JikanRelationResponse,
    Relation
} from "../types/jikan.js";

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4'
const RATE_LIMIT_DELAY_MS = 500; 

let lastRequestTime = 0;

async function sleep(ms: number) : Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function rateLimit() {
    const timeSinceLastRequest = Date.now() - lastRequestTime;
    console.log(`Time since last request: ${timeSinceLastRequest}ms`);

    if (timeSinceLastRequest < RATE_LIMIT_DELAY_MS) {
        await sleep(RATE_LIMIT_DELAY_MS - timeSinceLastRequest);
    }
    
    lastRequestTime = Date.now();
}

async function fetchWithRateLimit<T>(endpoint: string): Promise<T> {
    await rateLimit();
    const response = await fetch(`${JIKAN_BASE_URL}/${endpoint}`);
    return response.json() as Promise<T>;
}

export async function searchAnime(query: string): Promise<JikanSearchResponse> {
    const response = await fetchWithRateLimit<JikanSearchResponse>(`anime?q=${encodeURIComponent(query)}`);
    return response;
}

export async function getAnimeDetails(malId: number): Promise<AnimeDetails> {
    const response = await fetchWithRateLimit<AnimeDetails>(`anime/${malId}`);
    return response;
}

export async function getAnimeRelations(malId: number): Promise<JikanRelationResponse> {
    const response = await fetchWithRateLimit<JikanRelationResponse>(`anime/${malId}/relations`);
    return response;
}




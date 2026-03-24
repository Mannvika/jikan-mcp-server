import { searchAnime, getAnimeDetails, getAnimeRelations, getMangaRelations, RATE_LIMIT_DELAY_MS } from "../services/jikan-client.js";
import type { MergedFranchise, Relation, AnimeNode } from "../types/jikan.js";

const VALID_RELATION_TYPES = [
    "sequel", "prequel", "alternative version", "alternative setting", 
    "spin-off", "side story", "parent story", "summary", "other", "adaptation"
];

interface QueueNode{
    id: number;
    type: string;
}

export async function handleMergeFranchise(query: string) : Promise<MergedFranchise | null> {
    console.error(`Merging franchise for: ${query}`);

    // Find the root anime
    const searchResponse = await searchAnime(query);

    if(!searchResponse.data || searchResponse.data.length === 0) {
        console.error(`No results found for query: ${query}`);
        return null;
    }

    const rootAnime = searchResponse.data[0];
    if (!rootAnime) {
        console.error(`No valid anime data found for query: ${query}`);
        return null;
    }
    console.error("Found anime:", rootAnime.title);

    // BFS from the root to all its relations
    const visitedIds = new Set<string>();
    const queue: QueueNode[] = [{id: rootAnime.mal_id, type: "anime"}];
    const collectedEntries: MergedFranchise['entries'] = [];

    let apiCallCount = 0;
    
    const START_TIME = Date.now();
    const TIMEOUT_LIMIT_MS = 3 * 60 * 1000; 

    while(queue.length > 0){

        const elapsedTime = Date.now() - START_TIME;
        
        if(elapsedTime > TIMEOUT_LIMIT_MS) {
            console.error(`Timeout reached: ${elapsedTime}ms`);
            break;
        }

        // Pop first ID in queue
        const current = queue.shift()!;
        const nodeKey = `${current.type}-${current.id}`;

        // Skip if visited
        if(visitedIds.has(nodeKey)) continue;
        visitedIds.add(nodeKey);

        console.error(`Visiting ${current.type}: ${current.id}`);

        try{
            // Get the details of the current anime
            apiCallCount++;

            let relationsData: Relation[] = [];

            if(current.type === "anime") {
                const detailsResponse = await getAnimeDetails(current.id);
                const detailsData = detailsResponse.data;

                // Push it into the collected entries
                collectedEntries.push({
                    mal_id: detailsData.mal_id,
                    title: detailsData.title,
                    type: detailsData.type,
                    release_date: detailsData.aired?.from || null,
                    relation_to_root: current.id === rootAnime.mal_id ? "Root" : "Related"
                })

                const relationsResponse = await getAnimeRelations(current.id);
                relationsData = relationsResponse.data || [];
            } else if (current.type === "manga") {
                const relationsResponse = await getMangaRelations(current.id);
                relationsData = relationsResponse.data || [];
            }

            // Add new IDs if valid relation type
            for(const relationsGroup of relationsData){

                const relationName = relationsGroup.relation.toLowerCase();

                if(VALID_RELATION_TYPES.includes(relationName)){
                    for(const relation of relationsGroup.entry){
                        const relType = relation.type.toLowerCase();

                        if (current.type === "manga" && relType === "manga") {
                            console.error(`Pruned manga-to-manga jump to ID: ${relation.mal_id}`);
                            continue; 
                        }

                        const nextNodeKey = `${relType}-${relation.mal_id}`;
                        
                        if(!visitedIds.has(nextNodeKey)){
                            queue.push({ id: relation.mal_id, type: relType });
                        }
                    }
                }
                else{
                    console.error(`Skipping relation: "${relationsGroup.relation}" on ${current.type} ${current.id}`);                
                }
            }

        } catch(error) {
            console.error("Error fetching anime details:", error);
            continue;
        }
    }

    console.error("Collected entries:", collectedEntries.length);

    collectedEntries.sort((a, b) => {
            if (!a.release_date) return 1;
            if (!b.release_date) return -1;
            return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
        });
    
    const finalResult: MergedFranchise = {
        franchise_name: rootAnime?.title || "",
        root_mal_id: rootAnime?.mal_id || 0,
        entries: collectedEntries,
        total_entries: collectedEntries.length
    };
    
    return finalResult;
}

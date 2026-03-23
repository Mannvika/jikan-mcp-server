import { searchAnime, getAnimeDetails, getAnimeRelations } from "../services/jikan-client.js";
import type { MergedFranchise, Relation, AnimeNode } from "../types/jikan.js";

const VALID_RELATION_TYPES = ["Sequel", "Prequel", "Alternative version", "Alternative setting", "Spin-off", "Side story", "Parent story"];

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
    const visitedIds = new Set<number>();
    const queue: number[] = [rootAnime.mal_id];
    const collectedEntries: MergedFranchise['entries'] = [];

    while(queue.length > 0){
        // Pop first ID in queue
        const currentId = queue.shift()!;

        // Skip if visited
        if(visitedIds.has(currentId)) continue;
        visitedIds.add(currentId);

        console.error("Visiting anime:", currentId);

        try{
            // Get the details of the current anime
            const detailsResponse = await getAnimeDetails(currentId);
            const detailsData = detailsResponse.data;

            // Push it into the collected entries
            collectedEntries.push({
                mal_id: detailsData.mal_id,
                title: detailsData.title,
                type: detailsData.type,
                release_date: detailsData.aired?.from || null,
                relation_to_root: currentId === rootAnime.mal_id ? "Root" : "Related"
            })

            const relationsResponse = await getAnimeRelations(currentId);
            const relationsData = relationsResponse.data || [];

            // Add new IDs if valid relation type
            for(const relationsGroup of relationsData){
                if(VALID_RELATION_TYPES.includes(relationsGroup.relation)){
                    for(const relation of relationsGroup.entry){
                        if(relation.type === "anime" && !visitedIds.has(relation.mal_id)){
                            queue.push(relation.mal_id);
                        }
                    }
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

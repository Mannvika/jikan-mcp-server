// Anime and Manga nodes from Jikan API
export interface AnimeNode {
    mal_id: number;
    name: string;
    type: string; // Anime or Manga
    url: string;
}

export interface Relation{
    relation: string; // e.g., "Adaptation", "Prequel", "Sequel"
    entry: AnimeNode[];
}

export interface AnimeDetails {
    mal_id: number;
    title: string;
    title_english: string | null;
    type: string; // e.g., "TV", "Movie", "OVA"
    synopsis: string | null;
    aired: {
        from: string | null; // ISO 8601 date
        to: string | null; // ISO 8601 date
    };
    relations?: Relation[];
}

// API Wrappers (Jikan wraps respones in data objects)
export interface JikanSearchResponse{
    data: AnimeDetails[];
}

export interface JikanAnimeResponse{
    data: AnimeDetails;
}

export interface JikanRelationResponse{
    data: Relation[];
}

// Merge Franchise Tool
export interface MergedFranchise{
    franchise_name: string;
    root_mal_id: number;
    total_entries: number;
    entries: {
        mal_id: number;
        title: string;
        type: string;
        release_date: string | null;
        relation_to_root: string;
    }[]
}

export interface Artwork {
  storage_key: string;
  width: number;
  height: number;
}

export interface CatalogueEpisode {
  id: string;
  title: string;
  duration: number;
  languages: string[];
  artwork: {
    thumbnail?: string;
  };
}

export interface CatalogueSeason {
  id: string;
  season_number: number;
  episodes: CatalogueEpisode[];
  artwork: {
    poster?: string;
    banner?: string;
    thumbnail?: string;
  };
}

export interface CatalogueShow {
  id: string;
  title: string;
  synopsis: string;
  categories?: string[];
  seasons: CatalogueSeason[];
  episodes: CatalogueEpisode[];
  artwork: {
    poster?: string;
    banner?: string;
    thumbnail?: string;
  };
}

export type Catalogue = Record<string, CatalogueShow[]>;

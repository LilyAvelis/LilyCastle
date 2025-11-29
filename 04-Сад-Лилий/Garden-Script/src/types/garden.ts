export interface GardenConfig {
  garden: {
    taxonomy: TaxonomyNode[];
  };
}

export type TaxonomyNode = string | Record<string, TaxonomyNode[]>;

export interface TaxonValidationResult {
  valid: boolean;
  message?: string;
}

export interface TaxonParseResult {
  taxonPath: string[];
  gesture: string;
}

export interface GardenNode {
  children: Record<string, GardenNode>;
  functions: string[];
}

import { Endpoints } from '@octokit/types';
import ModelList from './model-list.json';

export type Platform = 'desktop' | 'mobile' | 'web';

export type Rank = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type RankInfo = {
	rank: Rank;
	rarity: number;
	xp?: number;
};

export type Ratings = 'general' | 'sensitive' | 'questionable' | 'explicit';

export enum TagCategories {
    'general' = 0,
    'artist' = 1,
    'copyright' = 3,
    'character' = 4,
    'meta' = 5,
    'year' = 6,
    'rating' = 9
}
export type TagCategoryType = keyof typeof TagCategories;

export type InferenceTag = {
    label: string;
	probability: number;
    count: number;
    rank?: Omit<RankInfo, 'xp'>
};

export type InferenceTags = Record<TagCategoryType, InferenceTag[]> & {rank?: RankInfo};

/**
 * "0": [label, category, count]
 */
export type RawTags = Record<string, [string, number, number]>;

export type TextFormat = 'space' | 'underscore' | 'prompt';

export type GithubReleaseResponse =
	Endpoints['GET /repos/{owner}/{repo}/releases/latest']['response']['data'];

export type ModelTags = Record<string, [string, number, number]>;


// Model List
export type ModelListCatalog = typeof ModelList
export type SupportedModels = Exclude<keyof ModelListCatalog, '$schema'>;
export type ModelEntry = ModelListCatalog[SupportedModels];
export type ModelVariant = ModelEntry['variants'][VariantType];
export type VariantType = keyof ModelEntry['variants'];
export type ModelKey = `${string}:${VariantType}`;
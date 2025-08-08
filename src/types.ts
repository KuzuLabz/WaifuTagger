import WD_TAGS from '../assets/tags.json';

export type Rank = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type RawTag = (typeof WD_TAGS)[0];

export type RankInfo = {
	rank: Rank;
	rarity: number;
	xp?: number;
};

export type Ratings = 'general' | 'sensitive' | 'questionable' | 'explicit';

export type ProbTag = RawTag & {
	probability: number;
};
export type InferenceTag = ProbTag & {
	rank?: RankInfo;
};

export type ProbTags = {
	rating: ProbTag[];
	general: ProbTag[];
	character: ProbTag[];
};

export type InferenceTags = {
	rating: InferenceTag[];
	general: InferenceTag[];
	character: InferenceTag[];
	rank: RankInfo;
};

export type SelectedImage = {
	uri: string;
	height: number;
	width: number;
	base64?: string;
	fileName?: string;
	mimeType?: string;
	md5?: string;
};

export type TextFormat = 'space' | 'underscore' | 'prompt';

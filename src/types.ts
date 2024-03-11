import WD_TAGS from '../assets/tags.json';

export type Tag = (typeof WD_TAGS)[0];

export type InferenceTag = Tag & {
	probability: number;
};

export type InferenceTags = {
	rating: InferenceTag[];
	general: InferenceTag[];
	character: InferenceTag[];
	ordered_tags: string[];
};

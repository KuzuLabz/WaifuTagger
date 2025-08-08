import { Platform } from 'react-native';
import {
	character_indexes,
	character_names,
	general_indexes,
	general_names,
	kaomojis,
	rating_indexes,
	tag_names,
} from './constants';
import { InferenceTags, ProbTags } from './types';
import { sigmoid, zip } from './utils';
import { getInferenceTags } from './ranking';

const min = 0.35;

export const getResults = (logits: Float32Array): InferenceTags => {
	const probabilities = Platform.OS === 'web' ? Array.from(logits).map(sigmoid) : logits;
	const new_labels: [string, number][] = zip([tag_names, probabilities]);
	const general_matches = new_labels.filter(
		(label) => label[1] > min && general_names.includes(label[0]),
	);
	const character_matches = new_labels.filter(
		(label) => label[1] > min && character_names.includes(label[0]),
	);
	const probTags: ProbTags = {
		rating: rating_indexes
			.map((rt) => ({
				...rt,
				probability: new_labels.find((label) => label[0] === rt.name)?.[1] ?? 0,
			}))
			.sort((a, b) => b.probability - a.probability),
		general: general_matches
			.sort((a, b) => b[1] - a[1])
			.map((gt) => ({
				...(general_indexes.find((gi) => gi.name === gt[0]) ?? {
					name: gt[0],
					category: 0,
					tag_id: 10000002,
					count: 0,
				}),
				name: kaomojis.includes(gt[0]) ? gt[0] : gt[0].replaceAll('_', ' '),
				probability: gt[1],
			})),
		character: character_matches
			.sort((a, b) => b[1] - a[1])
			.map((ct) => ({
				...(character_indexes.find((ci) => ci.name === ct[0]) ?? {
					name: ct[0],
					category: 0,
					tag_id: 10000002,
					count: 0,
				}),
				probability: ct[1],
			})),
	};
	const inferTags = getInferenceTags(probTags);

	return inferTags;
};

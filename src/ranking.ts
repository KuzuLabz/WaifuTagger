import { rankExp } from './constants';
import { InferenceTag, InferenceTags, ProbTags, Rank, RankInfo } from './types';

const config = {
	thresholds: {
		tag: [0, 0.0001, 0.0003, 0.0005, 0.0007, 0.001, 0.0014],
		image: [0, 0.0001, 0.0005, 0.001, 0.002, 0.005, 0.01],
	},
	minProb: 0.5,
	ranks: ['F', 'E', 'D', 'C', 'B', 'A', 'S'],
};

const getTagRarity = (count: number) => {
	return Number((1 / count).toFixed(10));
};

const getRank = (rarity: number, thresholds: number[]) => {
	for (const idx of thresholds.keys()) {
		if (rarity >= thresholds[idx] && rarity < thresholds[idx + 1]) {
			return config.ranks[idx] as Rank;
		}
	}
	return rarity >= thresholds.at(-1) ? 'S' : 'F';
};

export const getTagRank = (count: number): Omit<RankInfo, 'xp'> => {
	const rarity = getTagRarity(count);
	const rank = getRank(rarity, config.thresholds.tag);
	return { rank, rarity };
};

const getImageRank = (tags: InferenceTag[]): RankInfo => {
	const validTags = tags.filter((tag) => tag.probability >= config.minProb);
	let imageRarity = 0;
	validTags.forEach((tag) => {
		imageRarity += tag.rank.rarity;
	});
	const rank = getRank(imageRarity, config.thresholds.image);
	return { rank, rarity: imageRarity, xp: rankExp[rank] };
};

export const getInferenceTags = (tags: ProbTags): InferenceTags => {
	const characters: InferenceTag[] = tags.character.map<InferenceTag>((data) => {
		const rankInfo = getTagRank(data.count);
		return {
			...data,
			rank: rankInfo,
		};
	});
	const general: InferenceTag[] = tags.general.map<InferenceTag>((data) => {
		const rankInfo = getTagRank(data.count);
		return {
			...data,
			rank: rankInfo,
		};
	});

	return {
		rating: tags.rating,
		character: characters,
		general: general,
		rank: getImageRank([...characters, ...general]),
	};
};

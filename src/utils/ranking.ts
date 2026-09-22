import { RANK_XP } from '../constants';
import { InferenceTag, InferenceTags, Rank, RankInfo } from '../types';

export const rankingConfig = {
    // Percentile distribution cutoffs (F -> S)
    // F: bottom 50%, E: 50-70%, D: 70-85%, C: 85-93%, B: 93-97%, A: 97-99%, S: top 1%
    percentiles: [0.0, 0.50, 0.70, 0.85, 0.93, 0.97, 0.99],
    
    // Tag count cutoffs calculated from your dataset via calculatePercentileThresholds
    tagCountThresholds: [Infinity, 100000, 25000, 10000, 5000, 1500, 500],

    // Image rarity score cutoffs for overall image rank
    imageThresholds: [1, 2, 4, 8, 16, 32, 64],

    minProb: 0.35,
    ranks: ['F', 'E', 'D', 'C', 'B', 'A', 'S'] as const,
};

export const calculatePercentileThresholds = (allCounts: number[]): number[] => {
    // Sort ASCENDING (smallest / rarest counts first)
    const sorted = [...allCounts]
        .filter((c) => typeof c === 'number' && c > 0)
        .sort((a, b) => a - b);
        
    const total = sorted.length;
    if (total === 0) return [Infinity, Infinity, Infinity, Infinity, Infinity, Infinity, Infinity];

    return [
        Infinity, // F rank catches all high-count common tags
        sorted[Math.floor(0.50 * (total - 1))], // E
        sorted[Math.floor(0.30 * (total - 1))], // D
        sorted[Math.floor(0.15 * (total - 1))], // C
        sorted[Math.floor(0.07 * (total - 1))], // B
        sorted[Math.floor(0.03 * (total - 1))], // A
        sorted[Math.floor(0.01 * (total - 1))], // S
    ];
};

export const getTagRank = (count: number): Omit<RankInfo, 'xp'> => {
    if (typeof count !== 'number' || isNaN(count) || count <= 0) {
        return { rank: 'F', rarity: 1 };
    }

    for (let i = rankingConfig.ranks.length - 1; i >= 0; i--) {
        if (count <= rankingConfig.tagCountThresholds[i]) {
            const rank = rankingConfig.ranks[i] as Rank;
            const rarityScore = Math.pow(2, i); // F:1, E:2, D:4, C:8, B:16, A:32, S:64

            return { rank, rarity: rarityScore };
        }
    }

    return { rank: 'F', rarity: 1 };
};

const getRankFromThresholds = (val: number, thresholds: number[]): Rank => {
    for (let i = thresholds.length - 1; i >= 0; i--) {
        if (val >= thresholds[i]) {
            return rankingConfig.ranks[i] as Rank;
        }
    }
    return null;
};

export const getImageRank = (tags: InferenceTag[]): RankInfo => {
    const validTags = tags.filter((tag) => tag.probability >= rankingConfig.minProb);

    if (validTags.length === 0) {
        return { rank: 'F', rarity: 0, xp: RANK_XP['F'] };
    }

    const totalRarity = validTags.reduce((acc, tag) => acc + (tag.rank?.rarity ?? 1), 0);
    const imageRarity = Math.round(totalRarity / validTags.length);

    const rank = getRankFromThresholds(imageRarity, rankingConfig.imageThresholds);
    return { rank, rarity: imageRarity, xp: RANK_XP[rank] };
};

export const getInferenceTags = (tags: InferenceTags): InferenceTags => {
    const processedTags = Object.fromEntries(
        Object.entries(tags)
            .filter(([category]) => category !== 'rating' && category !== 'year')
            .map(([category, list]) => [
                category,
                (list as InferenceTag[]).map((data) => ({
                    ...data,
                    rank: category !== 'rating' && getTagRank(data.count),
                })),
            ])
    ) as Record<keyof typeof tags, InferenceTag[]>;

    return {
        ...processedTags,
        rating: tags.rating,
        rank: getImageRank(Object.values(processedTags).flat()),
    };
};

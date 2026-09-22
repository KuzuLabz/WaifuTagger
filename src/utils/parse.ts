import { InferenceTags, InferenceTag, RawTags, TagCategoryType, TagCategories } from '../types';
import { getImageRank, getTagRank } from './ranking';
import { ModelSettings } from '../store/models';

const min = 0.35;

const CategoriesUnranked: Partial<(TagCategoryType)>[] = ['rating', 'year']

export const parseResults = (
    tags: RawTags, 
    logits: Float32Array, 
    selected_candidates?: BigInt64Array
): InferenceTags | null => {
    if (!tags) {
        return null;
    }

    const categoryMap: Record<TagCategories, TagCategoryType> = {
        [TagCategories['general']]: 'general',
        [TagCategories['artist']]: 'artist',
        [TagCategories['character']]: 'character',
        [TagCategories['copyright']]: 'copyright',
        [TagCategories['meta']]: 'meta',
        [TagCategories['rating']]: 'rating',
        [TagCategories['year']]: 'year',
    };
    const categorizedTags: Record<keyof ModelSettings['thresholds'], InferenceTag[]> = {
        general: [],
        artist: [],
        character: [],
        copyright: [],
        meta: [],
        rating: [],
        year: [],
    };

    if (selected_candidates) {
        for (let i = 0; i < selected_candidates.length; i++) {
            const tagIndex = Number(selected_candidates[i]);
            const prob = logits[tagIndex];

            if (prob >= min) {
                const info = tags[tagIndex.toString()];
                if (!info) continue;

                const categoryKey = categoryMap[info[1]];
                const rank = CategoriesUnranked.includes(categoryKey) ? undefined : getTagRank(info[2]);
                const probTag: InferenceTag = { label: info[0], probability: prob, count: info[2], rank };
                
                categorizedTags[categoryKey]?.push(probTag);
            }
        }
    } else {
        for (let i = 0; i < logits.length; i++) {
            const prob = logits[i];
            if (prob >= min) {
                const info = tags[i.toString()];
                if (!info) continue;

                const categoryKey = categoryMap[info[1]];
                const rank = CategoriesUnranked.includes(categoryKey) ? undefined : getTagRank(info[2]);
                const probTag: InferenceTag = { label: info[0], probability: prob, count: info[2], rank };
                
                categorizedTags[categoryKey]?.push(probTag);
            }
        }
    }

    Object.keys(categorizedTags).forEach((category) => {
        categorizedTags[category as keyof ModelSettings['thresholds']].sort(
            (a, b) => b.probability - a.probability
        );
    });

    const probTags: InferenceTags = {
        ...categorizedTags,
        rank: getImageRank([...categorizedTags.general, ...categorizedTags.character, ...categorizedTags.copyright, ...categorizedTags.artist, ...categorizedTags.meta])
    };

    return probTags;
};

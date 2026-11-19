import { InferenceTags } from '../types';
import { useModelsStore } from '../store/models';
import { INIT_THRESHOLDS, MAX_TAGS } from '../constants';

export const useTags = (inferenceTags?: InferenceTags | null) => {
	const thresholds = useModelsStore((state) => state.selected ? state.settings[state.selected.type]?.thresholds ?? INIT_THRESHOLDS : null);
    const maxTags = useModelsStore((state) => state.selected ? state.settings[state.selected.type]?.maxTags ?? MAX_TAGS : null);

    const general = inferenceTags?.general.filter((tag, idx) => tag.probability >= (thresholds?.general ?? 0) && (maxTags && idx < maxTags)) ?? [];
    const character = inferenceTags?.character.filter((tag) => tag.probability >= (thresholds?.character ?? 0)) ?? [];
    const copyright = inferenceTags?.copyright.filter((tag) => tag.probability >= (thresholds?.copyright ?? 0)) ?? [];
    const artist = inferenceTags?.artist.filter((tag) => tag.probability >= (thresholds?.artist ?? 0)) ?? [];
    const meta = inferenceTags?.meta.filter((tag) => tag.probability >= (thresholds?.meta ?? 0)) ?? [];
    const year = inferenceTags?.year.filter((tag) => tag.probability >= (thresholds?.year ?? 0)) ?? [];


    if (!inferenceTags) {
        return null;
    }

	return { general, character, copyright, artist, meta, year, rating: inferenceTags?.rating, rank: inferenceTags?.rank };
};

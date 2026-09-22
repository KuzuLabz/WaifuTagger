import { InferenceTags } from '../types';
import { useModelsStore } from '../store/models';
import { INIT_THRESHOLDS, MAX_TAGS } from '../constants';

export const useTags = (inferenceTags?: InferenceTags) => {
	const thresholds = useModelsStore((state) => state.selected ? state.settings[state.selected.type]?.thresholds ?? INIT_THRESHOLDS : null);
    const maxTags = useModelsStore((state) => state.selected ? state.settings[state.selected.type]?.maxTags ?? MAX_TAGS : null);

    const general = inferenceTags?.general.filter((tag, idx) => tag.probability >= thresholds?.general && idx < maxTags);
    const character = inferenceTags?.character.filter((tag) => tag.probability >= thresholds?.character);
    const copyright = inferenceTags?.copyright.filter((tag) => tag.probability >= thresholds?.copyright);
    const artist = inferenceTags?.artist.filter((tag) => tag.probability >= thresholds?.artist);
    const meta = inferenceTags?.meta.filter((tag) => tag.probability >= thresholds?.meta);
    const year = inferenceTags?.year.filter((tag) => tag.probability >= thresholds?.year);


    if (!inferenceTags) {
        return null;
    }

	return { general, character, copyright, artist, meta, year, rating: inferenceTags?.rating, rank: inferenceTags?.rank };
};

import { useEffect, useMemo, useState } from 'react';
import { InferenceTags } from '../types';
import { useSettingsStore } from '../store/settings';

export const useTags = (fullTags?: InferenceTags) => {
	const { char_threshold, general_threshold } = useSettingsStore();
	const gTags = useMemo(
		() => fullTags?.general.filter((tag) => tag.probability >= general_threshold),
		[fullTags?.general, general_threshold],
	);
	const cTags = useMemo(
		() => fullTags?.character.filter((tag) => tag.probability >= char_threshold),
		[char_threshold, fullTags?.character],
	);

	return { generalTags: gTags, characterTags: cTags };
};

import { useEffect, useState } from 'react';
import { InferenceTags, TextFormat } from '../types';
import { TextSettings, useSettingsStore } from '../store/settings';

const getFormattedText = (tags: InferenceTags, config: TextSettings) => {
	const initTags = [
		...(config.includeCharacter ? tags.character.map((char) => `${char.name}`) : []),
		...tags.general.map((tag) => `${tag.name}`),
		...(config.includeRating ? [`${tags.rating[0].name}`] : []),
	];
	switch (config.textFormat) {
		case 'space':
			return initTags.map((tag) => tag.replaceAll('_', ' '));
		case 'underscore':
			return initTags.map((tag) => tag.replaceAll(' ', '_'));
		case 'prompt':
			return initTags.map((tag) =>
				tag.replaceAll('(', '\\(').replaceAll(')', '\\)').replaceAll('_', ' '),
			);
	}
};

export const useFormattedText = (tags: InferenceTags) => {
	const { textFormat, includeCharacter, includeRating, updateSettings } = useSettingsStore();
	const [text, setText] = useState('');

	const toggleChar = () => {
		updateSettings({ includeCharacter: !includeCharacter });
	};

	const toggleRating = () => {
		updateSettings({ includeRating: !includeRating });
	};

	const setFormat = () => {
		const formats: TextFormat[] = ['space', 'underscore', 'prompt'];
		const currentIndex = formats.findIndex((val) => textFormat === val);
		const nextIndex = currentIndex + 1 > formats.length - 1 ? 0 : currentIndex + 1;
		updateSettings({ textFormat: formats[nextIndex] });
	};

	const getTagText = () => {
		if (tags) {
			const newTags = getFormattedText(tags, { textFormat, includeCharacter, includeRating });
			setText(newTags.join(', '));
		}
	};

	useEffect(() => {
		getTagText();
	}, [tags, textFormat, includeCharacter, includeRating]);

	return {
		text,
		format: textFormat,
		includeCharacter,
		includeRating,
		setFormat,
		toggleChar,
		toggleRating,
	};
};

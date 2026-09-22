import { InferenceTag, InferenceTags, TagCategoryType, TextFormat } from '../types';
import { SettingsState, useSettingsStore } from '../store/settings';

const FORMATS: TextFormat[] = ['space', 'underscore', 'prompt'];
const FORMAT_RULES: Record<TextFormat, (label: string) => string> = {
    prompt: (label) => label.replace(/[_]/g, ' ').replace(/[()]/g, '\\$&'),
    space: (label) => label.replace(/_/g, ' '),
    underscore: (label) => label.replace(/ /g, '_'),
};

const processTags = (
    tags: InferenceTags,
    order: SettingsState['categoryOrder'],
    included: SettingsState['included'],
    textFormat: TextFormat
) => {
    if (!tags) {
        return { formattedTags: null, text: '' };
    }

    const rankByCategory: Record<string, number> = {};
    for (let i = 0; i < order.length; i++) {
        rankByCategory[order[i].category] = i;
    }

    const transformLabel = FORMAT_RULES[textFormat] ?? ((label) => label);
    const formattedTags = {} as Record<TagCategoryType, InferenceTag[]>;
    const textLabels: string[] = [];

    const categories = Object.keys(tags).filter(
        (cat) => cat !== 'rank' && included[cat as TagCategoryType]
    );

    categories.sort((a, b) => {
        const aIndex = rankByCategory[a] ?? Number.MAX_SAFE_INTEGER;
        const bIndex = rankByCategory[b] ?? Number.MAX_SAFE_INTEGER;
        return aIndex - bIndex;
    });

    for (const cat of categories) {
        const categoryTags = tags[cat as TagCategoryType];
        if (!categoryTags) continue;

        const formattedCategoryTags: InferenceTag[] = new Array(categoryTags.length);
        for (let i = 0; i < categoryTags.length; i++) {
            const tag = categoryTags[i];
            const newLabel = transformLabel(tag.label);
            
            formattedCategoryTags[i] = { ...tag, label: newLabel };
            textLabels.push(newLabel);
        }

        formattedTags[cat as TagCategoryType] = formattedCategoryTags;
    }

    return {
        formattedTags,
        text: textLabels.join(', '),
    };
};

export const useFormattedTags = (tags: InferenceTags) => {
    const textFormat = useSettingsStore((state) => state.textFormat);
    const included = useSettingsStore((state) => state.included);
    const order = useSettingsStore((state) => state.categoryOrder);
    const updateSettings = useSettingsStore((state) => state.updateSettings);

    if (!tags) {
        return { formattedTags: null, text: '', setFormat: () => {} };
    }

    const { formattedTags, text } = processTags(tags, order, included, textFormat);

    const setFormat = () => {
        const currentIndex = FORMATS.indexOf(textFormat);
        const nextIndex = (currentIndex + 1) % FORMATS.length;
        updateSettings({ textFormat: FORMATS[nextIndex] });
    };

    return {
        formattedTags,
        text,
        setFormat,
    };
};
import { Rank, TagCategoryType } from './types';
import ModelCatalog from './model-list.json';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

const REPO_URL = 'https://api.github.com/repos/KuzuLabz/WaifuTagger';
const RELEASES_URL = 'https://github.com/KuzuLabz/WaifuTagger/releases';
const PRIVACY_POLICY_URL = 'https://kuzulabz.com/docs/apps/WaifuTagger/privacy';

const { '$schema': _, ...MODEL_CATALOG } = ModelCatalog;

const LANGUAGES = {
    'en': 'English',
    'de': 'Deutsch',
    'es': 'Español',
    'fr': 'Français',
    'ja': '日本語',
    'ko': '한국인',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文'
};

const TAGS_FILENAME = 'tags.json';

const KAOMOJIS = [
    '0_0',
    '(o)_(o)',
    '+_+',
    '+_-',
    '._.',
    '<o>_<o>',
    '<|>_<|>',
    '=_=',
    '>_<',
    '3_3',
    '6_9',
    '>_o',
    '@_@',
    '^_^',
    'o_o',
    'u_u',
    'x_x',
    '|_|',
    '||_||',
];

// Return safebooru if on app store
const BOORU_URL = DeviceInfoModule.installerPackageName !== 'unknown'
    ? 'https://safebooru.donmai.us'
    : 'https://danbooru.donmai.us';

const INIT_THRESHOLDS = {
    character: 0.8,
    artist: 0.8,
    copyright: 0.8,
    meta: 0.8,
    year: 0.8,
    rating: 0.35,
    general: 0.35,
}

const MAX_TAGS = 50;

const CATEGORY_COLORS: Record<'dark' | 'light', Partial<Record<TagCategoryType, { backgroundColor: string, color: string }>>> = {
    dark: {
        artist: {
            color: '#f50a0ac6',
            backgroundColor: '#f50a0a20',
        },
        character: {
            color: '#28c700',
            backgroundColor: '#28c70020'
        },
        copyright: {
            color: '#d102ff',
            backgroundColor: '#d102ff20'
        },
        general: {
            color: '#00bbff',
            backgroundColor: '#00bbff20'
        },
        meta: {
            color: '#e1d609',
            backgroundColor: '#e1d60920'
        },
    },
    light: {
        artist: {
            color: '#FFFFFF',
            backgroundColor: '#f50a0ac6',
        },
        character: {
            color: '#FFFFFF',
            backgroundColor: '#28c700'
        },
        copyright: {
            color: '#FFFFFF',
            backgroundColor: '#d102ff'
        },
        general: {
            color: '#FFFFFF',
            backgroundColor: '#00bbff'
        },
        meta: {
            color: '#FFFFFF',
            backgroundColor: '#bbb424'
        },
    }
};

const RANK_XP: { [key in Rank]: number } = {
    F: 100,
    E: 150,
    D: 200,
    C: 250,
    B: 300,
    A: 400,
    S: 500,
};

export {
    KAOMOJIS,
    BOORU_URL,
    LANGUAGES,
    CATEGORY_COLORS,
    INIT_THRESHOLDS,
    MAX_TAGS,
    REPO_URL,
    RELEASES_URL,
    PRIVACY_POLICY_URL,
    TAGS_FILENAME,
    RANK_XP,
    MODEL_CATALOG
};
import WD_TAGS from '../assets/tags.json';

const rating_indexes = WD_TAGS.filter((tag) => tag.category === 9);
const general_indexes = WD_TAGS.filter((tag) => tag.category === 0);
const character_indexes = WD_TAGS.filter((tag) => tag.category === 4);
const tag_names = WD_TAGS.map((tag) => tag.name);
const character_names = character_indexes.map((tag) => tag.name);
const general_names = general_indexes.map((tag) => tag.name);

const kaomojis = [
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

export {
    rating_indexes,
    general_indexes,
    character_indexes,
    tag_names,
    character_names,
    general_names,
    kaomojis,
};

module.exports = {
    env: {
        browser: true,
        es2021: true,
        es6: true,
        node: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        // 'airbnb/hooks',
    ],
    overrides: [],
    ignorePatterns: [
        'src/store/services/anilist/generated-anilist.ts',
        'src/store/services/mal/malApi.ts',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: ['react', 'react-hooks', 'react-native', '@typescript-eslint', 'prettier'],
    rules: {
        indent: 'off',
        'linebreak-style': ['error', 'windows'],
        quotes: ['error', 'single', { allowTemplateLiterals: true, avoidEscape: true }],
        semi: ['error', 'always'],
        'react/react-in-jsx-scope': 'off',
        'no-empty-function': 'off',
        'prettier/prettier': ['error', { endOfLine: 'crlf' }],
        'no-empty-pattern': 'off',
        'react/prop-types': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'react/function-component-definition': [2, { namedComponents: 'arrow-function' }],
        'react-hooks/rules-of-hooks': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        'react/display-name': 'off',
        'no-mixed-spaces-and-tabs': 'off',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};

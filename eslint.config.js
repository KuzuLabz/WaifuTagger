// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
	expoConfig,
	eslintPluginPrettierRecommended,
	{
		ignores: ['dist/*'],
		rules: {
			quotes: ['error', 'single', { allowTemplateLiterals: true, avoidEscape: true }],
			'import/export': 'off',
			'@typescript-eslint/no-require-imports': 'off',
		},
	},
]);


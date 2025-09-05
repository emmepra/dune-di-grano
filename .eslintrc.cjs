module.exports = {
	root: true,
	extends: ['eslint:recommended', 'prettier'],
	plugins: ['svelte'],
	overrides: [
		{
			files: ['*.svelte'],
			processor: 'svelte/svelte'
		}
	],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2022
	},
	env: {
		browser: true,
		es2022: true,
		node: true
	}
};

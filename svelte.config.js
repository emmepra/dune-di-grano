//import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-netlify';
import { sveltePreprocess } from 'svelte-preprocess/dist/autoProcess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		alias: {
			$lib: 'src/lib',
		}
	},
	preprocess: [
		sveltePreprocess(),
	]
};

export default config;

//import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		alias: {
			$lib: 'src/lib',
		}
	},

};

export default config;

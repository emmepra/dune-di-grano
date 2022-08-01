//import adapter from '@sveltejs/adapter-auto';
import path from "path";

//import adapter from '@sveltejs/adapter-netlify';
import adapterStatic from '@sveltejs/adapter-static';
import sveltePreprocess from 'svelte-preprocess';

import svg from "vite-plugin-svgstring";
// import { PassThrough } from "stream";


/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: sveltePreprocess(),
	kit: {
		adapter: adapterStatic(),
		files: {
			assets: "static"
		},
		vite: {
			resolve: {
				alias: {
					$lib: path.resolve('src/lib'),
					$utils: path.resolve('src/utils'),
					$components: path.resolve('src/components'),
					$styles: path.resolve('src/styles'),
					$bulma: path.resolve('node_modules/bulma'),
					$data: path.resolve('src/data'),
					$assets: path.resolve('static/assets')
				}
			},
			server: {
				fs: {
					allow: ['static/assets/imgs',
							'static/assets/audio']
				}
			},
			plugins: [svg()]
		}
	}
};

export default config;

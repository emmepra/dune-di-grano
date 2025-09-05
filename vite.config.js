import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';
import svg from "vite-plugin-svgstring";

export default defineConfig({
	plugins: [sveltekit(), svg()],
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib'),
			$utils: path.resolve('./src/utils'),
			$components: path.resolve('./src/components'),
			$styles: path.resolve('./src/styles'),
			$bulma: path.resolve('./node_modules/bulma'),
			$data: path.resolve('./src/data')
		}
	}
});
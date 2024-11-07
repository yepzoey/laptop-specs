import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'docs',
			assets: 'docs',
			fallback: '404.html' }),
		paths: {
			base: process.argv.includes('dev') ? '' : '/laptop-specs',
		},
	},
};

export default config;
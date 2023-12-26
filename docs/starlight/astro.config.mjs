import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'GG Docs',
			social: {
				github: 'https://github.com/NigelBreslaw/guardian-ghost',
			},
			sidebar: [
				{
					label: 'Technologies',
					items: [
						{ label: 'CI', link: '/tech/ci/' },
						{ label: 'Misc', link: '/tech/misc/' },
					]
				},
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Getting started', link: '/guides/getting-started/' },
						{ label: 'Cloudflare', link: '/guides/cloudflare/' },

					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'Costs', link: '/reference/costs/' },
					]
				},
			],
		}),
	],
});

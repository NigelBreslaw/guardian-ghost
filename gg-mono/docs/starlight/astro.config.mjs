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
					label: 'Guides',
					items: [
						{ label: 'Getting started', link: '/guides/getting-started/' },
						{ label: 'Cloudflare', link: '/guides/cloudflare/' },

					],
				},
				{
					label: 'Technologies',
					items: [
						{ label: 'CI', link: '/tech/ci/' },
						{ label: 'Misc', link: '/tech/misc/' },
					]
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

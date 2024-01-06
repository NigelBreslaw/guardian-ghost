import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.guardianghost.com',
	integrations: [
		starlight({
			title: 'GG Docs',
			social: {
				email: 'mailto:support@guardianghost.com',
				twitter: 'https://twitter.com/GGuardianGhost',
				github: 'https://github.com/NigelBreslaw/guardian-ghost',
			},
			sidebar: [
				{
					label: 'Guides',
					items: [
						{ label: 'Monorepo', link: '/guides/monorepo/' },
						{ label: 'Cloudflare', link: '/guides/cloudflare/' },
						{ label: 'CI Maintenance', link: '/guides/ci-maintenance/' },
						{ label: 'Dependabot', link: '/guides/dependabot/' },
						{ label: 'CI', link: '/guides/ci/' },
						{ label: 'Misc', link: '/guides/misc/' },
						{ label: 'React Native', link: '/guides/react-native/' },
						{ label: 'Costs', link: '/guides/costs/' },
					],
				},
			],
		}),
	],
});

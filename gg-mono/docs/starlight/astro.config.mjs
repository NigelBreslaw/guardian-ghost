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
						{ label: 'Infrastructure', link: '/guides/infrastructure/' },
						{ label: 'Continuous Integration', link: '/guides/ci/' },
						{ label: 'Automated Deployment', link: '/guides/automated-deployment/' },
						{ label: 'Project Maintenance', link: '/guides/project-maintenance/' },
						{ label: 'React Native', link: '/guides/react-native/' },
						{ label: 'Costs', link: '/guides/costs/' },
						{ label: 'Misc', link: '/guides/misc/' },
					],
				},
			],
		}),
	],
});

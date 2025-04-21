import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://docs.guardianghost.com",
  integrations: [
    starlight({
      title: "GG Docs",
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/NigelBreslaw/guardian-ghost" },
        { icon: "email", label: "Email", href: "mailto:support@guardianghost.com" },
      ],
      sidebar: [
        {
          label: "Guides",
          items: [
            { label: "Monorepo", link: "/guides/monorepo/" },
            { label: "Coding Guidelines", link: "/guides/coding-guidelines/" },
            { label: "Architecture", link: "/guides/architecture/" },
            { label: "Infrastructure", link: "/guides/infrastructure/" },
            { label: "Continuous Integration", link: "/guides/ci/" },
            { label: "Automated Deployment", link: "/guides/automated-deployment/" },
            { label: "Project Maintenance", link: "/guides/project-maintenance/" },
            { label: "React Native", link: "/guides/react-native/" },
            { label: "Costs", link: "/guides/costs/" },
            { label: "Misc", link: "/guides/misc/" },
            { label: "Authentication", link: "/guides/authentication/" },
            { label: "To-do's", link: "/guides/todo/" },
          ],
        },
      ],
    }),
  ],
});

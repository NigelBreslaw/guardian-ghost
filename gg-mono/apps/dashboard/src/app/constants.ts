export const API_URL = `${import.meta.env.SITE}${import.meta.env.BASE_URL}api/`;

export const REMOTE_ASSETS_BASE_URL = "https://flowbite-admin-dashboard.vercel.app";

export const SITE_TITLE = "Flowbite Astro Admin Dashboard";

/* Useful flag for sourcing from `./data` entirely, disabling randomize layer */
export const RANDOMIZE = Boolean(import.meta.env.RANDOMIZE) || true;

export type ProjectTag = { label: string; color?: "acc" | "c2" | "c3" | "c4" | "c5" };

export interface Project {
	id: string;
	title: string;
	/** Short label shown on the home-page thumbnail */
	short: string;
	summary: string;
	description: string;
	tags: ProjectTag[];
	status?: string;
	github?: string;
	demo?: string;
	/** Real preview image of the live project (shown on the home card) */
	thumb?: { src: string; alt: string };
	/** Designed mark, used when the project has no logo or preview image */
	mark?: "route" | "coin";
	/** Short host shown on the card, for projects that are live */
	host?: string;
	live?: boolean;
}

export const projects: Project[] = [
	{
		id: "portfolio",
		title: "Portfolio — snjv.club",
		short: "Portfolio",
		summary: "This site: Astro, Tailwind and Cloudflare with automatic deploys.",
		description:
			"This site. An Astro static site deployed on Cloudflare with a CI/CD pipeline: every git push builds and ships to production automatically. Custom domain, DNS, and edge hosting all on Cloudflare.",
		tags: [
			{ label: "Astro", color: "c3" },
			{ label: "TypeScript", color: "c3" },
			{ label: "Tailwind CSS", color: "c4" },
			{ label: "Cloudflare", color: "c5" },
		],
		github: "https://github.com/guru-ng/fluffy-octo-chainsaw",
		demo: "https://snjv.club",
		thumb: { src: "/social-card.png", alt: "snjv.club link preview: Sanjeev Gurung, frontend developer" },
		host: "snjv.club",
		live: true,
	},
	{
		id: "runners-in-osaka",
		title: "Runners in Osaka",
		short: "Runners",
		summary: "A quiet running community app, piloting at run.snjv.club.",
		description:
			"A quiet running community app where runners log runs and match each other's distance — built for health and mindfulness, not competition. Astro + React on the frontend, Supabase for auth and data. Currently piloting at run.snjv.club.",
		tags: [
			{ label: "Astro", color: "c3" },
			{ label: "React", color: "c3" },
			{ label: "Supabase", color: "c4" },
			{ label: "In progress", color: "acc" },
		],
		status: "In progress",
		github: "https://github.com/guru-ng/run-app",
		demo: "https://run.snjv.club",
		mark: "route",
		host: "run.snjv.club",
		live: true,
	},
	{
		id: "kotobaquest",
		title: "KotobaQuest",
		short: "KotobaQuest",
		summary: "Japanese-learning games in the browser.",
		description:
			"A Japanese-learning games site: practise words through short games instead of flashcards.",
		tags: [
			{ label: "Web", color: "c3" },
			{ label: "Japanese learning", color: "c2" },
		],
		github: "https://github.com/guru-ng/kotobaQuest",
		demo: "https://kotobaquestapp.snjv.club",
		thumb: {
			src: "https://kotobaquestapp.snjv.club/og-image.png",
			alt: "KotobaQuest: learn Japanese by playing one puzzle a day",
		},
		host: "kotobaquestapp.snjv.club",
		live: true,
	},
	{
		id: "money-tracker",
		title: "Money Tracker",
		short: "Money Tracker",
		summary: "A privacy-first personal finance app for Japan, built with Flutter.",
		description:
			"A privacy-first personal finance app for Japan, built with Flutter. Currently in progress.",
		tags: [
			{ label: "Flutter", color: "c4" },
			{ label: "Dart", color: "c4" },
			{ label: "In progress", color: "acc" },
		],
		status: "In progress",
		mark: "coin",
	},
];

// Raw shape returned by the microCMS REST API
type MicrocmsRawItem = {
	id: string;
	title?: string;
	description?: string;
	contents?: unknown;
	publishedAt?: string;
	publishDate?: string;
	updatedAt?: string;
	published?: boolean;
	draft?: boolean;
	ogImage?: string | { url?: string };
	coverImage?: {
		url?: string;
		alt?: string;
	};
	tags?: string[];
};

const MICROCMS_SERVICE_DOMAIN = import.meta.env.MICROCMS_SERVICE_DOMAIN as string | undefined;
const MICROCMS_API_KEY = import.meta.env.MICROCMS_API_KEY as string | undefined;

function requireEnv() {
	if (!MICROCMS_SERVICE_DOMAIN) throw new Error("Missing env: MICROCMS_SERVICE_DOMAIN");
	if (!MICROCMS_API_KEY) throw new Error("Missing env: MICROCMS_API_KEY");
}

function baseUrl() {
	// MICROCMS_SERVICE_DOMAIN may be either "xxxx" or the full "xxxx.microcms.io".
	const domain = (MICROCMS_SERVICE_DOMAIN as string).includes(".")
		? (MICROCMS_SERVICE_DOMAIN as string)
		: `${MICROCMS_SERVICE_DOMAIN}.microcms.io`;
	return `https://${domain}/api/v1`;
}

async function microcmsFetch<T>(path: string, init?: RequestInit): Promise<T> {
	requireEnv();

	const url = `${baseUrl()}${path}`;
	const apiKey = MICROCMS_API_KEY as string;

	const res = await fetch(url, {
		...init,
		headers: {
			"X-API-KEY": apiKey,
			"Content-Type": "application/json",
			...(init?.headers ?? {}),
		},
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`microCMS request failed: ${res.status} ${res.statusText} ${text}`);
	}

	return (await res.json()) as T;
}

type MicrocmsListResponse<T> = {
	contents: T[];
	totalCount?: number;
	limit: number;
	offset: number;
};

const COLLECTION_ENDPOINT = "blog";

/**
 * Normalized post shape that mirrors an Astro content-collection entry
 * (`{ id, slug, collection, data: {...} }`) so the rest of the theme's
 * components can consume microCMS posts without any special-casing.
 */
export type MicrocmsPost = {
	id: string;
	slug: string;
	collection: "post";
	data: {
		title: string;
		description: string;
		contents: unknown;
		publishDate: Date;
		updatedDate?: Date | undefined;
		ogImage?: string | undefined;
		draft: boolean;
		coverImage?: { src: string; alt: string } | undefined;
		tags: string[];
	};
};

function toDate(val?: string): Date {
	if (!val) return new Date(0);

	// Handle Japanese-formatted dates like "2026年05月30日 17:00" (optional seconds),
	// which native Date cannot parse. Treat as JST (+09:00).
	const jp = val.match(
		/(\d{4})年(\d{1,2})月(\d{1,2})日\s*(?:(\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
	);
	if (jp) {
		const [, y, mo, d, h = "0", mi = "0", s = "0"] = jp;
		const pad = (n: string | number | undefined, len = 2) =>
			String(n ?? "0").padStart(len, "0");
		const iso = `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:${pad(s)}+09:00`;
		const parsed = new Date(iso);
		if (!Number.isNaN(parsed.getTime())) return parsed;
	}

	const d = new Date(val);
	return Number.isNaN(d.getTime()) ? new Date(0) : d;
}

/** Map a raw microCMS API item into the theme's normalized post shape. */
function mapToPost(raw: MicrocmsRawItem): MicrocmsPost {
	const id = String(raw.id ?? "");
	const ogImage = typeof raw.ogImage === "object" ? raw.ogImage?.url : raw.ogImage;

	const coverImage =
		raw.coverImage?.url != null
			? { src: raw.coverImage.url, alt: raw.coverImage.alt ?? "" }
			: undefined;

	return {
		id,
		slug: id,
		collection: "post",
		data: {
			title: String(raw.title ?? ""),
			description: String(raw.description ?? ""),
			contents: raw.contents,
			publishDate: toDate(raw.publishedAt ?? raw.publishDate),
			updatedDate: raw.updatedAt ? toDate(raw.updatedAt) : undefined,
			ogImage: ogImage || undefined,
			draft: Boolean(raw.draft ?? raw.published === false),
			coverImage,
			tags: Array.isArray(raw.tags) ? raw.tags : [],
		},
	};
}

export async function getMicrocmsPosts(params: {
	limit: number;
	offset: number;
}): Promise<MicrocmsPost[]> {
	const res = await microcmsFetch<MicrocmsListResponse<MicrocmsRawItem>>(
		`/${COLLECTION_ENDPOINT}?limit=${params.limit}&offset=${params.offset}`,
	);
	return res.contents.map(mapToPost);
}

export async function getMicrocmsPostById(id: string): Promise<MicrocmsPost> {
	const res = await microcmsFetch<MicrocmsRawItem>(`/${COLLECTION_ENDPOINT}/${id}`);
	return mapToPost(res);
}

export async function getMicrocmsPostsCount(): Promise<number> {
	const res = await microcmsFetch<{ totalCount: number; contents: MicrocmsRawItem[] }>(
		`/${COLLECTION_ENDPOINT}?limit=1&offset=0`,
	);
	return res.totalCount ?? 0;
}

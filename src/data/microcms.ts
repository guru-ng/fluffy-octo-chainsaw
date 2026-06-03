// Raw item returned by the microCMS REST API. Field names vary per service,
// so we keep this loose and resolve known/alternate keys in mapToPost().
type MicrocmsRawItem = Record<string, unknown> & {
	id: string;
	publishedAt?: string;
	updatedAt?: string;
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

/** Case-insensitively pick the first matching key's value from a raw item. */
function pick(raw: MicrocmsRawItem, names: string[]): unknown {
	const keys = Object.keys(raw);
	for (const name of names) {
		const match = keys.find((k) => k.toLowerCase() === name.toLowerCase());
		if (match != null && raw[match] != null && raw[match] !== "") return raw[match];
	}
	return undefined;
}

/** Strip HTML tags and collapse whitespace for plain-text excerpts. */
function toPlainText(val: unknown): string {
	if (typeof val !== "string") return "";
	return val
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

/** Map a raw microCMS API item into the theme's normalized post shape. */
function mapToPost(raw: MicrocmsRawItem): MicrocmsPost {
	const id = String(raw.id ?? "");

	// Field names differ per microCMS service, so accept common alternates.
	const contents = pick(raw, ["contents", "content", "body", "richEditor"]);
	const rawTitle = pick(raw, ["title", "name", "heading", "subject"]);
	const rawDescription = pick(raw, ["description", "summary", "excerpt", "lead"]);
	const dateVal = pick(raw, ["date", "publishDate", "publishedAt"]) ?? raw.publishedAt;

	const plain = toPlainText(contents);
	// Fall back to a content excerpt when there's no dedicated title/description.
	const title = String(rawTitle ?? "") || (plain ? `${plain.slice(0, 60)}` : "(Untitled)");
	const description = String(rawDescription ?? "") || plain.slice(0, 160);

	const ogImageRaw = pick(raw, ["ogImage", "ogimage"]);
	const ogImage =
		ogImageRaw && typeof ogImageRaw === "object"
			? (ogImageRaw as { url?: string }).url
			: (ogImageRaw as string | undefined);

	const coverRaw = pick(raw, ["coverImage", "cover", "eyecatch", "thumbnail", "image"]) as
		| { url?: string; alt?: string }
		| undefined;
	const coverImage =
		coverRaw?.url != null ? { src: coverRaw.url, alt: coverRaw.alt ?? "" } : undefined;

	const tagsRaw = pick(raw, ["tags", "categories"]);

	return {
		id,
		slug: id,
		collection: "post",
		data: {
			title,
			description,
			contents,
			publishDate: toDate(typeof dateVal === "string" ? dateVal : undefined),
			updatedDate: raw.updatedAt ? toDate(raw.updatedAt) : undefined,
			ogImage: ogImage || undefined,
			draft: Boolean(pick(raw, ["draft"]) ?? raw.published === false),
			coverImage,
			tags: Array.isArray(tagsRaw) ? (tagsRaw as string[]) : [],
		},
	};
}

export async function getMicrocmsPosts(params: {
	limit: number;
	offset: number;
	/** microCMS `orders` value, e.g. "-publishedAt" (default) for newest first. */
	orders?: string;
}): Promise<MicrocmsPost[]> {
	const orders = params.orders ?? "-publishedAt";
	const query = `limit=${params.limit}&offset=${params.offset}&orders=${encodeURIComponent(orders)}`;
	const res = await microcmsFetch<MicrocmsListResponse<MicrocmsRawItem>>(
		`/${COLLECTION_ENDPOINT}?${query}`,
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

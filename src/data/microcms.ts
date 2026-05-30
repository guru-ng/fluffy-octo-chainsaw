export type MicrocmsPostListItem = {
	id: string;
	title?: string;
	description?: string;
	contents?: unknown;
	publishedAt?: string;
	updatedAt?: string;
	published?: boolean;
	draft?: boolean;
	ogImage?: string;
	coverImage?: {
		url?: string;
		alt?: string;
	};
};

const MICROCMS_SERVICE_DOMAIN = import.meta.env.MICROCMS_SERVICE_DOMAIN as string | undefined;
const MICROCMS_API_KEY = import.meta.env.MICROCMS_API_KEY as string | undefined;

function requireEnv() {
	if (!MICROCMS_SERVICE_DOMAIN) throw new Error("Missing env: MICROCMS_SERVICE_DOMAIN");
	if (!MICROCMS_API_KEY) throw new Error("Missing env: MICROCMS_API_KEY");
}

function baseUrl() {
	// ex: https://o5q4jwgvjf.microcms.io/api/v1
	return `https://${MICROCMS_SERVICE_DOMAIN}/api/v1`;
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

type MicrocmsSingleResponse<T> = T & { id?: string };

const COLLECTION_ENDPOINT = "blog";

export type MicrocmsPost = {
	id: string;
	title: string;
	description: string;
	contents: unknown;
	publishDate: Date;
	updatedDate?: Date | undefined;
	ogImage?: string;
	draft?: boolean;
};

function toDate(val?: string): Date {
	if (!val) return new Date(0);
	const d = new Date(val);
	return d;
}

export async function getMicrocmsPosts(params: { limit: number; offset: number }) {
	type Item = MicrocmsPostListItem & { id: string };
	const res = await microcmsFetch<MicrocmsListResponse<Item>>(
		`/${COLLECTION_ENDPOINT}?limit=${params.limit}&offset=${params.offset}`,
	);

	const items = res.contents;
	return items.map((it) => {
		const id = String((it as any).id ?? "");
		const updatedDate = it.updatedAt ? toDate(it.updatedAt) : undefined;
		return {
			id,
			title: String(it.title ?? ""),
			description: String(it.description ?? ""),
			contents: it.contents,
			publishDate: toDate(it.publishedAt ?? (it as any).publishDate),
			updatedDate,
			draft: Boolean(it.draft ?? (it as any).published === false),
			ogImage: String((it as any).ogImage ?? ""),
		};
	});
}

export async function getMicrocmsPostById(id: string): Promise<MicrocmsPost> {
	type Item = MicrocmsPostListItem & { id: string };
	const res = await microcmsFetch<MicrocmsSingleResponse<Item>>(`/${COLLECTION_ENDPOINT}/${id}`);
	const it = res;
	return {
		id: String((it as any).id ?? id),
		title: String(it.title ?? ""),
		description: String(it.description ?? ""),
		contents: it.contents,
		publishDate: toDate(it.publishedAt ?? (it as any).publishDate),
		updatedDate: it.updatedAt ? toDate(it.updatedAt) : undefined,
		draft: Boolean(it.draft ?? (it as any).published === false),
		ogImage: String((it as any).ogImage ?? ""),
	};
}

export async function getMicrocmsPostsCount(): Promise<number> {
	type Item = MicrocmsPostListItem & { id: string };
	const res = await microcmsFetch<{ totalCount: number; contents: Item[] }>(
		`/${COLLECTION_ENDPOINT}?limit=1&offset=0`
	);
	return res.totalCount ?? 0;
}


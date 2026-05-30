import type { MicrocmsPost } from "./microcms";

export type NormalizedPost = {
	id: string;
	title: string;
	description: string;
	publishDate: Date;
	updatedDate?: Date | undefined;
	ogImage?: string;
	draft?: boolean;
	contents: unknown;
};

export function normalizeMicrocmsPost(p: MicrocmsPost): NormalizedPost {
	return p;
}


import { browser } from '$app/environment';
import { findAllInChunk, findFirstInChunk } from './piSearchWasm';

type Metadata = {
	totalDigits: number;
	chunkSize: number;
	binaryAvailable: boolean;
	binarySize: number;
};

export type SearchResult = {
	index: number;
};

const METADATA_URL = '/api/pi-metadata';
const BINARY_URL = '/pi-digits.bin';

let metadataPromise: Promise<Metadata> | null = null;

async function getMetadata(): Promise<Metadata> {
	if (!metadataPromise) {
		metadataPromise = fetch(METADATA_URL)
			.then((res) => {
				if (!res.ok) throw new Error('Failed to load pi metadata');
				return res.json();
			})
			.then((data) => data as Metadata);
	}
	return metadataPromise;
}

async function fetchChunk(start: number, end: number): Promise<Uint8Array> {
	const res = await fetch(BINARY_URL, {
		headers: {
			Range: `bytes=${start}-${end - 1}`
		}
	});

	if (!(res.status === 200 || res.status === 206)) {
		throw new Error(`Failed to fetch pi chunk: HTTP ${res.status}`);
	}

	const buf = await res.arrayBuffer();
	return new Uint8Array(buf);
}

function patternToBytes(pattern: string): Uint8Array {
	const cleaned = pattern.trim();
	if (!/^[0-9]+$/.test(cleaned)) {
		throw new Error('Pattern must be digits only');
	}
	const arr = new Uint8Array(cleaned.length);
	for (let i = 0; i < cleaned.length; i += 1) {
		arr[i] = cleaned.charCodeAt(i) - 48;
	}
	return arr;
}

export async function searchFirst(pattern: string): Promise<SearchResult | null> {
	if (!browser) return null;

	const meta = await getMetadata();
	const needle = patternToBytes(pattern);
	const m = needle.length;

	if (m === 0 || m > meta.totalDigits) {
		return null;
	}

	const chunkSize = meta.chunkSize;
	let cursor = 0;

	while (cursor + m <= meta.totalDigits) {
		const start = cursor === 0 ? 0 : Math.max(0, cursor - (m - 1));
		const end = Math.min(meta.totalDigits, start + chunkSize + (m - 1));

		const chunk = await fetchChunk(start, end);
		const idx = await findFirstInChunk(chunk, needle);

		if (idx >= 0) {
			const absolute = start + idx;
			return { index: absolute };
		}

		cursor = start + chunkSize;
	}

	return null;
}

export async function searchAll(pattern: string, maxResults: number): Promise<SearchResult[]> {
	if (!browser) return [];

	const meta = await getMetadata();
	const needle = patternToBytes(pattern);
	const m = needle.length;

	if (m === 0 || m > meta.totalDigits || maxResults <= 0) {
		return [];
	}

	const chunkSize = meta.chunkSize;
	let cursor = 0;
	const results: SearchResult[] = [];

	while (cursor + m <= meta.totalDigits && results.length < maxResults) {
		const start = cursor === 0 ? 0 : Math.max(0, cursor - (m - 1));
		const end = Math.min(meta.totalDigits, start + chunkSize + (m - 1));

		const chunk = await fetchChunk(start, end);
		const localIndexes = await findAllInChunk(chunk, needle, maxResults - results.length);

		for (const local of localIndexes) {
			const absolute = start + local;
			if (absolute >= cursor && results.length < maxResults) {
				results.push({ index: absolute });
			}
		}

		cursor = start + chunkSize;
	}

	return results;
}



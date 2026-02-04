import { browser } from '$app/environment';

type WasmModule = {
	default?: (module_or_path?: unknown) => Promise<unknown>;
	find_first: (haystack: Uint8Array, needle: Uint8Array) => number;
	find_all: (haystack: Uint8Array, needle: Uint8Array, max_results: number) => Uint32Array | number[];
};

const WASM_JS_URL: string = '/pkg/pi_search_wasm.js';

let wasmReady: Promise<WasmModule> | null = null;

async function loadWasm() {
	if (!browser) {
		throw new Error('WASM search can only be loaded in the browser');
	}
	if (!wasmReady) {
		wasmReady = (async () => {
			// Files under /static are served from the web root (no `/static` prefix).
			const mod = (await import(/* @vite-ignore */ WASM_JS_URL)) as unknown as WasmModule;

			// wasm-pack output exports an async default init that loads `pi_search_wasm_bg.wasm`
			// relative to `pi_search_wasm.js`.
			await (mod as any).default?.();
			return mod;
		})().catch((e) => {
			wasmReady = null;
			throw e;
		});
	}
	return wasmReady;
}

export async function findFirstInChunk(haystack: Uint8Array, needle: Uint8Array): Promise<number> {
	const wasm = await loadWasm();
	return wasm.find_first(haystack, needle);
}

export async function findAllInChunk(
	haystack: Uint8Array,
	needle: Uint8Array,
	maxResults: number
): Promise<number[]> {
	const wasm = await loadWasm();
	const res = wasm.find_all(haystack, needle, maxResults);
	return Array.isArray(res) ? res : Array.from(res);
}



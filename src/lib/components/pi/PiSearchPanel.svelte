<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import type { SearchResult } from '$lib/piSearchClient';
	import { searchAll, searchFirst } from '$lib/piSearchClient';
	import { onMount } from 'svelte';

	type Mode = 'first' | 'all';

	let pattern = $state('14159');
	let maxResults = $state(250);
	let results = $state<SearchResult[]>([]);
	let isSearching = $state(false);
	let error = $state<string | null>(null);
	let lastMode = $state<Mode>('first');
	let lastDurationMs = $state<number | null>(null);

	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});

	async function run(mode: Mode) {
		if (!mounted) return;
		lastMode = mode;
		isSearching = true;
		error = null;
		results = [];
		const t0 = performance.now();
		try {
			if (mode === 'first') {
				const r = await searchFirst(pattern);
				results = r ? [r] : [];
			} else {
				results = await searchAll(pattern, maxResults);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Search failed';
		} finally {
			lastDurationMs = Math.round(performance.now() - t0);
			isSearching = false;
		}
	}
</script>

<section
	class="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
>
	<div class="absolute inset-0 opacity-70">
		<div
			class="absolute -left-10 -top-10 h-44 w-44 rounded-full bg-sky-500/10 blur-3xl"
		></div>
		<div
			class="absolute -right-10 -bottom-10 h-44 w-44 rounded-full bg-fuchsia-500/10 blur-3xl"
		></div>
	</div>

	<div class="relative flex flex-col gap-5">
		<header class="flex items-start justify-between gap-4">
			<div class="space-y-1">
				<h1 class="text-balance text-2xl font-semibold tracking-tight text-white">
					π-seek
					<span class="text-white/60">—</span>
					<span class="text-white/80">search 100,000,000 digits</span>
				</h1>
				<p class="text-sm text-white/60">
					Client-side WASM search with incremental Range fetches.
				</p>
			</div>
			<div
				class="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70 transition hover:bg-black/30"
			>
				<div class="font-mono leading-4">mode: {lastMode}</div>
				<div class="font-mono leading-4">
					{#if lastDurationMs !== null}{lastDurationMs}ms{/if}
				</div>
			</div>
		</header>

		<div class="grid gap-4 md:grid-cols-3">
			<div class="md:col-span-2">
				<Label for="pattern" class="px-1 text-white/80">Digits pattern</Label>
				<div class="mt-2 flex items-center gap-3">
					<div class="relative flex-1">
						<input
							id="pattern"
							class="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 font-mono text-sm text-white placeholder:text-white/30 outline-none ring-0 transition will-change-transform focus:border-sky-400/40 focus:bg-black/35 focus:shadow-[0_0_0_4px_rgba(56,189,248,0.12)]"
							bind:value={pattern}
							placeholder="1415926535"
							inputmode="numeric"
							autocomplete="off"
							spellcheck="false"
						/>
						<div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/35">
							{pattern.trim().length} digits
						</div>
					</div>
					<Button
						class="h-11 rounded-xl transition active:scale-[0.98]"
						disabled={isSearching || !pattern.trim()}
						onclick={() => run('first')}
					>
						{isSearching && lastMode === 'first' ? 'Scanning…' : 'Find first'}
					</Button>
				</div>
			</div>

			<div>
				<Label for="maxResults" class="px-1 text-white/80">Find all cap</Label>
				<div class="mt-2 flex items-center gap-3">
					<input
						id="maxResults"
						type="number"
						min={1}
						max={10000}
						class="h-11 w-28 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-fuchsia-400/40 focus:bg-black/35 focus:shadow-[0_0_0_4px_rgba(217,70,239,0.12)]"
						bind:value={maxResults}
					/>
					<Button
						variant="outline"
						class="h-11 flex-1 rounded-xl border-white/15 bg-white/5 text-white transition hover:bg-white/10 active:scale-[0.98]"
						disabled={isSearching || !pattern.trim()}
						onclick={() => run('all')}
					>
						{isSearching && lastMode === 'all' ? 'Hunting…' : `Find all`}
					</Button>
				</div>
			</div>
		</div>

		{#if error}
			<div class="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
				<div class="font-semibold">Search error</div>
				<div class="mt-1 font-mono text-xs opacity-90">{error}</div>
			</div>
		{/if}

		<div class="grid gap-4 lg:grid-cols-3">
			<div class="lg:col-span-2">
				<div class="flex items-center justify-between">
					<h2 class="text-sm font-semibold text-white/80">Matches</h2>
					<div class="text-xs text-white/50">
						{#if isSearching}
							Working…
						{:else}
							{results.length} result{results.length === 1 ? '' : 's'}
						{/if}
					</div>
				</div>
				<div class="mt-3">
					{#if isSearching}
						<div class="space-y-2">
							{#each Array.from({ length: 6 }) as _, i (i)}
								<div class="h-10 w-full animate-pulse rounded-xl bg-white/5"></div>
							{/each}
						</div>
					{:else if results.length === 0}
						<div class="rounded-xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-white/60">
							No matches yet. Try a pattern like <span class="font-mono text-white/80">14159</span>.
						</div>
					{:else}
						<ul class="max-h-[320px] space-y-2 overflow-auto pr-1">
							{#each results as r, i (r.index)}
								<li
									class="group rounded-xl border border-white/10 bg-black/20 px-4 py-3 transition hover:border-white/20 hover:bg-black/30"
								>
									<div class="flex items-center justify-between gap-4">
										<div class="text-sm text-white/80">
											<span class="font-mono text-white/60">#{i + 1}</span>
											<span class="ml-2 font-mono text-white">{r.index}</span>
										</div>
										<button
											type="button"
											class="text-xs text-white/40 opacity-0 transition group-hover:opacity-100 hover:text-white/70"
											onclick={() => navigator.clipboard?.writeText(String(r.index))}
										>
											Copy
										</button>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>

			<aside class="rounded-2xl border border-white/10 bg-black/20 p-4">
				<h3 class="text-sm font-semibold text-white/80">Quick tips</h3>
				<ul class="mt-3 space-y-2 text-xs text-white/55">
					<li>
						<span class="font-semibold text-white/70">Digits only</span>
						— no dots/spaces.
					</li>
					<li>
						<span class="font-semibold text-white/70">Find all</span>
						— keep the cap sane for short patterns.
					</li>
					<li>
						<span class="font-semibold text-white/70">Range fetch</span>
						— stops early on first match.
					</li>
				</ul>
			</aside>
		</div>
	</div>
</section>



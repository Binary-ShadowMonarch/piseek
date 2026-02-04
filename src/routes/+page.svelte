<script lang="ts">
	import RandomAcrylicBackground from '$lib/components/background/RandomAcrylicBackground.svelte';
	import PiSearchPanel from '$lib/components/pi/PiSearchPanel.svelte';
	import BirthdayPanel from '$lib/components/pi/BirthdayPanel.svelte';
</script>

<RandomAcrylicBackground />

<main class="mx-auto w-full max-w-7xl px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
	<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
		<div class="text-xs text-white/50">
			<span class="font-mono text-white/70">static</span>
			<span class="mx-2 text-white/30">•</span>
			<span class="font-mono">pi-digits.bin</span>
			<span class="text-white/40"> (95MB)</span>
		</div>
		<button
			type="button"
			class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur-xl transition hover:bg-white/10 active:scale-[0.98]"
			onclick={() => window.location.reload()}
		>
			Remix background
		</button>
	</div>
	
	<!-- Main Pi Search Panel (full width) -->
	<div class="mb-6">
		<PiSearchPanel />
	</div>
	
	<!-- Two column layout for Birthday and About sections -->
	<div class="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
		<BirthdayPanel />

		<div>
			<section class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl h-full">
				<h2 class="text-base font-semibold text-white/90 mb-4">About This Project</h2>
				
				<div class="space-y-4">
					<div>
						<h3 class="text-sm font-medium text-white/80 mb-2">🔍 What is this?</h3>
						<p class="text-xs leading-relaxed text-white/60">
							Search for any numeric sequence within the first <span class="font-mono text-white/80">100 million digits</span> of Pi (π). Every birthday, phone number, or lucky number is probably hiding somewhere in these infinite digits.
						</p>
					</div>
					
					<div>
						<h3 class="text-sm font-medium text-white/80 mb-2">⚡ Technology Stack</h3>
						<ul class="text-xs leading-relaxed text-white/60 space-y-1">
							<li>• <span class="font-mono text-white/75">Rust + WASM</span> for blazing-fast binary search</li>
							<li>• <span class="font-mono text-white/75">SvelteKit</span> with glassmorphic UI design</li>
							<li>• <span class="font-mono text-white/75">95MB binary file</span> loaded client-side</li>
							<li>• Real-time incremental search as you type</li>
						</ul>
					</div>
					
					<div>
						<h3 class="text-sm font-medium text-white/80 mb-2">🎨 Design Philosophy</h3>
						<p class="text-xs leading-relaxed text-white/60">
							This interface celebrates computational beauty with dynamic acrylic backgrounds and glass morphism. The chaos is the canvas; the search is the art.
						</p>
					</div>
				</div>
			</section>
		</div>
		</div>
</main>

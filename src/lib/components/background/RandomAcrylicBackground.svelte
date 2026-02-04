<script lang="ts">
	import { onMount } from 'svelte';

	type Shape = {
		id: string;
		cx: number;
		cy: number;
		r: number;
		hue: number;
		alpha: number;
		blur: number;
	};

	let width = $state(0);
	let height = $state(0);
	let shapes = $state<Shape[]>([]);

	function mulberry32(seed: number) {
		return () => {
			let t = (seed += 0x6d2b79f5);
			t = Math.imul(t ^ (t >>> 15), t | 1);
			t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	function regen() {
		// new seed each reload
		const seed = Math.floor(Math.random() * 2 ** 31);
		const rand = mulberry32(seed);

		const w = Math.max(width, 1200);
		const h = Math.max(height, 800);

		const count = 12 + Math.floor(rand() * 10);
		const next: Shape[] = [];
		for (let i = 0; i < count; i += 1) {
			const r = Math.floor(80 + rand() * 260);
			next.push({
				id: `${seed}-${i}`,
				cx: Math.floor(rand() * (w + r * 2) - r),
				cy: Math.floor(rand() * (h + r * 2) - r),
				r,
				hue: Math.floor(rand() * 360),
				alpha: 0.08 + rand() * 0.18,
				blur: 10 + rand() * 60
			});
		}
		shapes = next;
	}

	onMount(() => {
		const onResize = () => {
			width = window.innerWidth;
			height = window.innerHeight;
			regen();
		};
		onResize();
		window.addEventListener('resize', onResize, { passive: true });
		return () => window.removeEventListener('resize', onResize);
	});
</script>

<div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
	<!-- base gradient -->
	<div
		class="absolute inset-0 bg-[radial-gradient(1200px_circle_at_15%_10%,rgba(56,189,248,0.16),transparent_55%),radial-gradient(900px_circle_at_85%_25%,rgba(168,85,247,0.14),transparent_52%),radial-gradient(1100px_circle_at_40%_90%,rgba(34,197,94,0.12),transparent_55%),linear-gradient(to_bottom,rgba(2,6,23,1),rgba(2,6,23,0.95))]"
	></div>

	<!-- weird objects (soft blobs) -->
	<svg class="absolute inset-0 h-full w-full" viewBox={`0 0 ${Math.max(width, 1)} ${Math.max(
		height,
		1
	)}`} preserveAspectRatio="none" aria-hidden="true">
		<defs>
			<filter id="softBlur">
				<feGaussianBlur stdDeviation="28" />
			</filter>
		</defs>

		{#each shapes as s (s.id)}
			<g filter="url(#softBlur)" opacity="1">
				<circle
					cx={s.cx}
					cy={s.cy}
					r={s.r}
					fill={`hsla(${s.hue}, 92%, 62%, ${s.alpha})`}
				/>
				<circle
					cx={s.cx + s.r * 0.28}
					cy={s.cy - s.r * 0.18}
					r={Math.max(18, s.r * 0.35)}
					fill={`hsla(${(s.hue + 30) % 360}, 92%, 64%, ${s.alpha * 0.9})`}
					style={`filter: blur(${s.blur}px);`}
				/>
			</g>
		{/each}
	</svg>

	<!-- subtle grain -->
	<div class="absolute inset-0 opacity-[0.10] mix-blend-overlay">
		<div
			class="h-full w-full bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22><filter id=%22n%22 x=%220%22 y=%220%22 width=%22100%25%22 height=%22100%25%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22300%22 height=%22300%22 filter=%22url(%23n)%22 opacity=%220.35%22/></svg>')]"
		></div>
	</div>
</div>



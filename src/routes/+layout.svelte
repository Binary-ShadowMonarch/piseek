<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="min-h-dvh antialiased selection:bg-sky-400/30 selection:text-white">
	{@render children()}
</div>

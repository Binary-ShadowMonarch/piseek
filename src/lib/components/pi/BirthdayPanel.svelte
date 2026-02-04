<script lang="ts">
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { getLocalTimeZone, today, type CalendarDate } from '@internationalized/date';

	const id = $props.id();

	let open = $state(false);
	let value = $state<CalendarDate | undefined>();

	let birthdayText = $derived(
		value
			? value.toDate(getLocalTimeZone()).toLocaleDateString(undefined, { dateStyle: 'full' })
			: null
	);
</script>

<section class="rounded-2xl border border-white/10 bg-black/5 p-5 backdrop-blur-xl">
	<div class="flex items-start justify-between gap-4">
		<div>
			<h2 class="text-sm font-semibold text-white/80">Birthday oracle</h2>
			<p class="mt-1 text-xs text-white/55">
				Because every overengineered app deserves an unrelated ritual.
			</p>
		</div>
		<div class="rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-[10px] text-white/60">
			<span class="font-mono">UTC±</span>
		</div>
	</div>

	<div class="mt-4">
		<Label for="{id}-date" class="px-1 text-white/80">Date of birth</Label>
		<Popover.Root bind:open>
			<Popover.Trigger id="{id}-date">
				{#snippet child({ props })}
					<Button
						{...props}
						variant="outline"
						class="mt-2 w-full justify-between rounded-xl border-white/15 bg-black/20 cursor-pointer font-normal text-white hover:bg-white/30"
					>
						<span class="truncate">
							{birthdayText ?? 'Select date'}
						</span>
						<ChevronDownIcon />
					</Button>
				{/snippet}
			</Popover.Trigger>
<Popover.Content
  class="w-auto overflow-hidden p-0 bg-transparent"
  align="start"
>
  <div class="rounded-xl border border-white/10 bg-black/10 shadow-xl backdrop-blur-md">
    <Calendar
      type="single"
      bind:value
      captionLayout="dropdown"
      onValueChange={() => (open = false)}
      maxValue={today(getLocalTimeZone())}
      class="bg-transparent text-white"
    />
  </div>
</Popover.Content>

		</Popover.Root>
	</div>

	{#if birthdayText}
		<div class="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
			<div class="text-xs text-white/55">Chosen date</div>
			<div class="mt-1 text-sm text-white/80">{birthdayText}</div>
			<div class="mt-2 text-[11px] text-white/45">
				Your pattern destiny is:
				<span class="font-mono text-white/70">{String(value?.day ?? 0).padStart(2, '0')}{String(
					value?.month ?? 0
				).padStart(2, '0')}{String(value?.year ?? 0).slice(-2)}</span>
			</div>
		</div>
	{/if}
</section>



<script lang="ts">
	export let title: string;
	export let color: string = '#1b3558';
	export let className: string = '';
</script>

<h2
	class="ml-8 font-heading section-header-tab relative z-20 flex items-center justify-center gap-3 px-6 py-3 text-lg font-extrabold text-white uppercase shadow-md md:text-2xl {className}"
	style="background-color: {color}; border-radius: 12px 12px 0 0; width: fit-content; text-align: center;"
>
	{@html title}
</h2>

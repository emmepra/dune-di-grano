<script>
  import { onMount } from "svelte";

  let Scrolly;
  onMount(async () => {
    const module = await import(`./Map.svelte`);
    Scrolly = module.default;
  });
</script>

<svelte:component this={Scrolly} />
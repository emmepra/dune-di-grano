<script>
  // export let alt = "";
  import loadImage from "$utils/loadImage";
  import Hero from "$components/bulma/Hero.svelte";
//   const dev = process.env.NODE_ENV === "development";
  // import TitleBox from "$components/layout/TitleBox.svelte"
  
  import imm from '$lib/assets/imgs/wheat.png';

</script>

<!-- implementare metodo gestione URL -->
<!-- {#await loadImage(`${dev ? "/" : "/aztec-gods/"}assets/${localUrl}`)} -->
<!-- {#await loadImage(`$lib/imgs/${localUrl}`)}
  <div>Loading {alt}</div>
{:then img} -->

<Hero bulma="is-halfheight cov-image" style="background-image: url({imm})">
  <div class="hero-body">
      <!-- <TitleBox /> -->
  </div>
</Hero>

<!-- {:catch error}
{console.warn(error)}
{/await} -->

<style>
  div {
    margin: 0 auto;
  }

</style>
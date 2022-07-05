<script>
  export let localUrl = "";
  export let alt = "";
  import loadImage from "$utils/loadImage";
  import Hero from "$components/layout/Hero.svelte";
//   const dev = process.env.NODE_ENV === "development";
  import TitleBox from "$components/layout/TitleBox.svelte"

</script>

<!-- implementare metodo gestione URL -->
<!-- {#await loadImage(`${dev ? "/" : "/aztec-gods/"}assets/${localUrl}`)} -->
{#await loadImage(`static/assets/imgs/${localUrl}`)}
  <div>Loading {alt}</div>
{:then img}

<Hero bulma="is-fullheight cov-image" style="background-image: url('static/assets/imgs/{localUrl}')">
  <div class="hero-body">
      <TitleBox />
  </div>
</Hero>

{:catch error}
{console.warn(error)}
{/await}

<style>
  div {
    margin: 0 auto;
  }

</style>
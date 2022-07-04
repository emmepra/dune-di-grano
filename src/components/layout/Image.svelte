<script>
  export let localUrl = "";
  export let alt = "";
  import loadImage from "$utils/loadImage";
//   const dev = process.env.NODE_ENV === "development";
    import Hero from "$components/intro/Hero.svelte"

</script>

<!-- {#await loadImage(`${dev ? "/" : "/aztec-gods/"}assets/${localUrl}`)} -->
{#await loadImage(`static/assets/imgs/${localUrl}`)}
  <div>Loading {alt}</div>
{:then img}
<section class="hero is-primary is-fullheight header-image" style="background-image: url('static/assets/imgs/{localUrl}')">
    <!-- <img src={img.src} {alt} /> -->
    <section class="hero-body">
        <Hero />
    </section>
</section>


{:catch error}
{console.warn(error)}
{/await}

<style>
  div,
  img {
    margin: 0 auto;
  }

.header-image {
    /* background-image: url("static/assets/imgs/{localUrl}"); */
    background-position: center center;
    background-repeat: no-repeat;
    /* background-attachment: fixed; */
    background-size: cover;
    background-color: #999;
}

</style>
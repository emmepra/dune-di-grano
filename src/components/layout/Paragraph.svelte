<script>
  export let content = undefined;
  let {title, pars} = content;
</script>

<!-- VECCHIA DISPOSIZIONE PER TITOLI MULTIPLI NELLO STESSO PARAGRAFO -->
<!-- <section class="container grid">
  <div class="columns">
    <div class="column content grid-xl">  
      {#each content as cont, i}
        {#if cont.title.length !== 0}
          <h1>{@html cont.title} </h1>
        {/if}

        {#each cont.pars as p, i}
          {#if cont.title.length == 0 && i == 0}
            <p class='cap'>{@html p}</p>
          {/if}
          <p>{@html p}</p>
        {/each}
      {/each}
    </div>
  </div>
</section> -->

<section class="container p-3 grid">
  <div class="columns">
    <div class="column content grid-xl">  
      {#if title.length !== 0}
        <h4>{@html title} </h4>
      {/if}

      {#each pars as p, i}
        {#if title.length == 0 && i == 0}
          <p class='cap'>{@html p}</p>
        {:else}
          <p>{@html p}</p>
        {/if}
      {/each}
    </div>
  </div>
</section>

<style lang="css">

  h4 {
    margin-bottom: 0.5rem;
    color: var(--color-gray-dark);
    font-family: var(--sans);
    text-align: left;
    font-size: 1.5rem;
    line-height: 1.65;
  }

  .grid {
    display: grid;
    grid-template-columns:
     [xl-start] 1fr 1.5em [md-start] minmax(0,660px) [md-end] 1.5rem 1fr [xl-end];
  }

  .grid * {grid-column: md; }
  .grid-xl {grid-column: xl; }

  p {
    max-width: 42em;
    margin-bottom: 1rem;
    font-family: var(--serif);
    text-align: left;
    font-size: 1.1rem;
    line-height: 1.65;
  }
  p.cap:first-letter {
    color: var(--color-highlight);
    font-family: "Aztec 2 Web", Georgia;
    font-size: 3rem;
    line-height: 1;

    padding-right: 0.2rem;
    padding-left: 0.1rem;
  }
  p:last-of-type {
    margin-bottom: 0;
  }
  @media only screen and (min-width: 30em) {
    p {
      font-size: 1.1rem;
    }
  }
</style>
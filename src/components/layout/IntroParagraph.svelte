<script>
  export let content = undefined;
</script>

<section class="container grid">
  <div class="columns">
    <div class="column content grid-xl">  
      {#each content as cont, i}
        <h1>{@html cont.title} </h1>
        {#each cont.pars as p, i}
          <p>{@html p}</p>
        {/each}
      {/each}
    </div>
  </div>
</section>

<style lang="css">

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
    font-size: 1rem;
    line-height: 1.65;
  }
  p:last-of-type {
    margin-bottom: 0;
  }
  @media only screen and (min-width: 30em) {
    p {
      font-size: 1rem;
    }
  }
</style>
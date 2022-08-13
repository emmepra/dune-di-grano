<script>
  import wordmark from "$lib/assets/svg/24bs_head.svg"
  import sock from "$lib/assets/svg/sock.svg"
  import cross from "$lib/assets/svg/cross.svg"
</script>

<nav class="level">  
  <div class="wordmark level-item has-text-centered">
    <a href="http://24orebs.com">{@html wordmark}</a>
  </div>
</nav>

<style>

 .level {
  margin-bottom: 0;
 }
  
  .wordmark {
    max-width: 10em;
    margin: 0 auto;
    padding: 1em 0;
  }
  .wordmark a {
    border: none;
    color: var(--color-fg);
  }
  .wordmark a:hover {
    background-color: transparent;
  }
  /* :global(.wordmark svg path) {
    fill: currentColor;
  } */
</style>
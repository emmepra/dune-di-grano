<script>
  import wordmark from "$lib/assets/svg/wordmark.svg"
  import sock from "$lib/assets/svg/sock.svg"
</script>

<header>
  <div class="wordmark">
    <a href="https://emmepra.it">{@html wordmark}</a>
  </div>
</header>

<style>
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
  :global(.wordmark svg path) {
    fill: currentColor;
  }
</style>
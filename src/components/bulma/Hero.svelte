<script>
  export let id = undefined;
  export let bulma = '';
  export let style = undefined;
</script>

<section {id} class='hero {bulma}' style={style}>
  <slot />
</section>

<style>
  .cov-image {
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
    background-color: #fafafa;
}
</style>
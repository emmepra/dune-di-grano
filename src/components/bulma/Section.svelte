<!-- <script>
  import variables from "$data/variables.json";

  export let id = undefined;
  export let fullBleed = false;
  export let background = variables.color.background;
</script>
 -->
 
<script>
  export let id = undefined;
  export let bulma = '';
  export let style = undefined;
</script>

<section {id} class='section {bulma}' style={style}>
  <slot />
</section>
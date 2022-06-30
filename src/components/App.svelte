<script context="module">
    import doc from "$data/doc.json"
    import Hero from "$components/intro/Hero.svelte"

    import Section from "$components/layout/Section.svelte"
    import IntroParagraph from "$components/layout/IntroParagraph.svelte"
</script>

<Section id="intro">
  <div class="intro">
    {#each doc.intro as p, i}
      <IntroParagraph>{@html p}</IntroParagraph>
    {/each}
  </div>
</Section>
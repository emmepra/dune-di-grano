<script context="module">
    import doc from "$data/doc.json"
    import Hero from "$components/intro/Hero.svelte"
    import Section from "$components/layout/Section.svelte"
    import IntroParagraph from "$components/layout/IntroParagraph.svelte"
    import Paragraph from "$components/layout/Paragraph.svelte"
    import Heading from "$components/layout/Heading.svelte"

    import Image from "$components/layout/Image.svelte"

    import Map from "$components/map/Map.svelte"
</script>

<Image localUrl={'grano.jpg'} />

<Map />

<Section id="intro">
  <div class="intro">
    {#each doc.intro as p, i}
      <IntroParagraph hasCap={i === 0}>{@html p}</IntroParagraph>
    {/each}
  </div>
</Section>

<Section id="iconography">
  <Heading>{@html doc.iconography_title}</Heading>

  <Paragraph hasCap={true}>{@html doc.iconography_intro}</Paragraph>
  <Paragraph>{@html doc.iconography_imaginarygods}</Paragraph>
</Section>


<script context="module">
    import doc from "$data/doc.json"

    import Section from "$components/bulma/Section.svelte"
    
    import IntroParagraph from "$components/layout/IntroParagraph.svelte"
    import Paragraph from "$components/layout/Paragraph.svelte"
    import Heading from "$components/layout/Heading.svelte"
    import Map from "$components/layout/Map.svelte"
    import Quote from "$components/layout/Quote.svelte"

    // import CoverImg from "$components/layout/CoverImg.svelte"

</script>

<Map />

<Quote content={doc.quote} />
<!-- <CoverImg localUrl={'wheat.png'} /> -->

<IntroParagraph content={doc.intro}/>

<Section id="iconography">
  <Heading>{@html doc.iconography_title}</Heading>

  <Paragraph hasCap={true}>{@html doc.iconography_intro}</Paragraph>
  <Paragraph>{@html doc.iconography_imaginarygods}</Paragraph>
</Section>


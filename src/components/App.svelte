<script context="module">
    import doc from "$data/doc.json"

    import Section from "$components/bulma/Section.svelte"
    
    import Paragraph from "$components/layout/Paragraph.svelte"
    import Map from "$components/layout/Map.svelte"
    import Quote from "$components/layout/Quote.svelte"

    import Plot from "$components/plot/Plot.svelte"
    import CoverImg from "$components/layout/CoverImg.svelte"

</script>


<CoverImg localUrl={'wheat.png'} />

<Quote content={doc.quote} />
<Map />

<Section id='introduction' bulma={'p-3'}>
  <Paragraph content={doc.intro}/>
  <Paragraph content={doc.intro2}/>

  <section class="container">
    <div class="columns is-centered">
      <div class="column is-11">
        <Plot />
      </div>
    </div>
  </section>
  
</Section>





<!-- <Section id="iconography">
  <Heading>{@html doc.iconography_title}</Heading>

  <Paragraph hasCap={true}>{@html doc.iconography_intro}</Paragraph>
  <Paragraph>{@html doc.iconography_imaginarygods}</Paragraph>
</Section> -->


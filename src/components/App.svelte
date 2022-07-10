<script>
  import doc from "$data/doc.json"

  import Section from "$components/bulma/Section.svelte"

  import Paragraph from "$components/layout/Paragraph.svelte"
  import Map from "$components/layout/Map.svelte"
  import Quote from "$components/layout/Quote.svelte"

  import Plot from "$components/plot/Plot.svelte"
  import CoverImg from "$components/layout/CoverImg.svelte"

  import VizExport from "$components/plot/VizExport.svelte"
  // import VizWheat from "$components/plot/VizWheat.svelte"
  // import VizInfl from "$components/plot/VizInfl.svelte"
</script>

<!-- <CoverImg localUrl={'wheat.png'} /> -->

<Map />

<Quote content={doc.quote} />

<Section id='parte1' bulma={'p-3'}>
  <Paragraph capDrop={true} content={doc.intro} />
  <Paragraph content={doc.intro2}/>

  <!-- <section class="container p-5">
    <div class="columns is-centered">
      <div class="column is-11">
        <Plot />
      </div>
    </div>
  </section> -->
  
  <VizExport />

</Section>

<Section id='parte2' bulma={'p-3'}>
  <Paragraph content={doc.intro} div={true}/>
  <Paragraph content={doc.intro2}/>

  <!-- <VizWheat /> -->

</Section>


<style>
  hr.divider{
    width: 25%;
    margin-left: auto;
    margin-right: auto;
    border-width: 1px;
    background-color: var(--color-highlight);;

  }
</style>

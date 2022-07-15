<script>
  import doc from "$data/doc.json"

  import Section from "$components/bulma/Section.svelte"

  import Paragraph from "$components/layout/Paragraph.svelte"
  import Map from "$components/layout/Map.svelte"
  import Quote from "$components/layout/Quote.svelte"

  import CoverImg from "$components/layout/CoverImg.svelte"

  import VizPWeath from "$components/plot/VizPWeath/Viz.svelte"
  import VizImport from "$components/plot/VizImport/Scrolly.svelte"
  // import VizInfl from "$components/plot/VizInfl.svelte"
</script>

<!-- <CoverImg localUrl={'wheat.png'} /> -->

<Map />

<Quote content={doc.quote} />

<Section id='parte1' bulma={'p-3'}>
  <Paragraph capDrop={true} content={doc.parte2_1} />
  <VizImport />
  <Paragraph content={doc.parte2_2}/>

  <!-- <section class="container p-5">
    <div class="columns is-centered">
      <div class="column is-11">
        <Plot />
      </div>
    </div>
  </section> -->
  

</Section>

<Section id='parte2' bulma={'p-3'}>
  <Paragraph content={doc.parte3_1} div={true}/>
  <Paragraph content={doc.parte3_2}/>

  <VizPWeath />

  <Paragraph content={doc.parte3_3}/>


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

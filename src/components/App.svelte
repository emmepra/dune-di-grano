<script>
  import doc from "$data/doc.json"

  import Section from "$components/bulma/Section.svelte"
  import Image from "$components/bulma/Image.svelte"

  import Paragraph from "$components/layout/Paragraph.svelte"
  import Map from "$components/layout/Map.svelte"
  import Quote from "$components/layout/Quote.svelte"
  
  import Breaking from "$components/layout/Breaking.svelte"

  import CoverImg from "$components/layout/CoverImg.svelte"

  import VizPWeath from "$components/plot/VizPWeath/Viz.svelte"
  import VizImport from "$components/plot/VizImport/Scrolly.svelte"

  import Audio from "$components/helpers/Audio.svelte"

  // si potrebbe creare un modulo per l'import di tutti gli asset da dare poi in input alle componenti generiche
  import image1 from "$lib/assets/imgs/image1.png"
  import image3 from "$lib/assets/imgs/image3.png"
  import tweet from "$lib/assets/imgs/tweet.png"
</script>

<Map />

<Quote content={doc.quote} />

<Section id='parte2' bulma={'p-3'}>

  <Audio />

  <Paragraph capDrop={true} content={doc.parte2_1} />
  <Image src={image1} desc={doc.image1.desc} place={doc.image1.place} bulma={'is-two-fifths m-4'} bulma_img={'is-4by3'}/>
  <Paragraph capDrop={false} content={doc.parte2_2} />
  <Image src={image3} desc={doc.image2.desc} place={doc.image2.place} bulma={'is-two-fifths m-4'} bulma_img={'is-4by3'}/>
  <Paragraph capDrop={false} content={doc.parte2_3} />
  <VizImport />

</Section>

<Section id='parte3' bulma={'p-3'}>

  <Paragraph content={doc.parte3_1} div={false}/>  
  <VizPWeath />
  <Paragraph content={doc.parte3_2}/>
  <Paragraph content={doc.parte3_3}/>

</Section>

<Section id='parte4' bulma={'p-3'}>

  <Breaking />
  <Paragraph content={doc.parte4_1} div={false}/>
  <Image src={tweet} bulma={'is-one-quarter m-4'} bulma_img={'is-4by5'}/>
  <Paragraph content={doc.parte4_2} div={false}/>
  
</Section>

<CoverImg localUrl={'wheat.png'}/>

<style>
</style>

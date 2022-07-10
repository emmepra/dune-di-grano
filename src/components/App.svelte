<script>
  import doc from "$data/doc.json"

  import Section from "$components/bulma/Section.svelte"

  import Paragraph from "$components/layout/Paragraph.svelte"
  import Map from "$components/layout/Map.svelte"
  import Quote from "$components/layout/Quote.svelte"
  import Scrolly from "$components/helpers/Scrolly.svelte"

  import Plot from "$components/plot/Plot.svelte"
  import CoverImg from "$components/layout/CoverImg.svelte"

import Iframe from "$components/Iframe.svelte"

let contStep;
let steps = ['prova 1', 'prova 2', 'prova 3'];
</script>

<!-- <CoverImg localUrl={'wheat.png'} /> -->

<Map />

<Quote content={doc.quote} />

<Section id='introduction' bulma={'p-3'}>
  <Paragraph content={doc.intro}/>
  <Paragraph content={doc.intro2}/>

  <section class="container p-5">
    <div class="columns is-centered">
      <div class="column is-11">
        <Plot />
      </div>
    </div>
  </section>
</Section>


<div class="section-container">

  <div class="steps-container">
    <Scrolly bind:value={contStep}>
      {#each steps as text, i}
          <div class="step" class:active={contStep === i}>
              <div class="step-content">
                  <p>{text}</p>
              </div>
          </div>
      {/each}
      <div class="spacer" />
    </Scrolly>
  </div>

  <div class="sticky">
    <Iframe />
  </div>

</div>

<style>
	:global(body) {
		overflow-x: hidden;
	}
	
	.hero {
		height: 60vh;
		display: flex;
		place-items: center;
		flex-direction: column;
		justify-content: center;
		text-align: center;
	}
	
	.hero h2 {
		margin-top: 0;
		font-weight: 200;
	}
	
  .spacer {
    height: 40vh;
  }

  .sticky {
    position: sticky;
    top: 10%;
		flex: 1 1 60%;
    width: 60%;
  }

  .section-container {
    margin-top: 1em;
    text-align: center;
    transition: background 100ms;
    display: flex;
  }

  .step {
    height: 80vh;
    display: flex;
    place-items: center;
    justify-content: center;
  }

  .step-content {
    font-size: 1rem;
    background: whitesmoke;
    color: #ccc;
    border-radius: 5px;
    padding: .5rem 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    transition: background 500ms ease;
    box-shadow: 1px 1px 10px rgba(0, 0, 0, .2);
    text-align: left;
		width: 75%;
		margin: auto;
		max-width: 500px;
  }

	.step.active .step-content {
		background: white;
		color: black;
	}
	
  .steps-container,
  .sticky {
    height: 100%;
  }

  .steps-container {
    flex: 1 1 40%;
    z-index: 10;
  }
	
/* Comment out the following line to always make it 'text-on-top' */
  @media screen and (max-width: 768px) {
    .section-container {
      flex-direction: column-reverse;
    }
    .sticky {
      width: 95%;
			margin: auto;
    }
  }
</style>

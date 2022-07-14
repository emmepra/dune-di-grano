<script>
    import Iframe from "$components/Iframe.svelte"
    import Scrolly from "$components/helpers/Scrolly.svelte"
  
  let value;
  const steps = [
		 "This is a dynamic, responsive scatterplot that uses Russell Goldenberg's <a href='' target='_blank'><code>Scrolly</code></a> to update its points' values on scroll.",
    "The scatterplot uses tweened values to automatically update your points with smooth transitions. It also binds to the width of the container <code>div</code>, so its responsive by default.",
    "Try resizing me to see the 'side-by-side' version, compared to the 'text-on-top' version that appears on small screens.</><>Want it to always appear 'text-on-top'? Just comment out the media query at the bottom of our styles (as in, leave the styles but comment out the surrounding <code>media</code> query).",
  ];
</script>


<!-- <section class="container"> -->

    <div class="section-container">
        
        <div class="steps-container">
            <Scrolly bind:value>
            {#each steps as text, i}
                <div class="step" class:active={value === i}>
                    <div class="step-content">
                        <p class="m-4">{@html text}</p>
                    </div>
                </div>
            {/each}
            </Scrolly>
        </div>
    
        <div class="sticky">
            <Iframe />
        </div>
    
    </div>

<!-- </section> -->

<!-- <div class="spacer" /> -->

<style>
	
p {
    max-width: 42em;
    margin-bottom: 1rem;
    font-family: var(--serif);
    text-align: left;
    font-size: 1.1rem;
    line-height: 1.65;
}
	
  .sticky {
    position: sticky;
    top: 10%;
	flex: 1 1 60%;
    width: 60%;
  }

  .section-container {
    margin-top: 2em;
    margin-bottom: 1em;
    text-align: center;
    transition: background 1000ms;
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
    opacity: 0.5;
    /* color: #ccc; */
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
        opacity: 1;
		/* color: black; */
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
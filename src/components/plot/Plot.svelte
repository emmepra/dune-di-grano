
<script>
    // import { Runtime, Inspector } from "@observablehq/runtime";
    import { Runtime, Inspector } from "./runtime.js";
    import plt from "./plot.js";
    
    import { onMount } from "svelte/internal";
    
    onMount(async () => {
        new Runtime().module(plt, name => {
            if (name === "chart") return new Inspector(document.querySelector("#observablehq-chart-d8e2dd59"));
        }); 
    });
    
</script>

<!-- Sviluppare possibilità di inserimento Titolo + Descrizione + Credits -->
<!-- Inserire input per nome grafico da App.Svelte -->

<div class="centered">
    <div id="observablehq-chart-d8e2dd59"></div>
</div>


<style>
.centered {
    display: flex;
    justify-content: center;
}
</style>
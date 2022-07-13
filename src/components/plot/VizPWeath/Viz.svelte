<!-- <svelte:head> 
    <script src="https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js"></script>
    <script src="https://api.observablehq.com/d/f295841077b38798.js?v=3"></script>
</svelte:head> -->

<script>

    import {Runtime, Library, Inspector} from "../runtime.js"
    import define from './index.js';

    import { onMount } from "svelte/internal";
    
    onMount(async () => {
        //new Runtime().module(define, Inspector.into(".ciao"));
        (new Runtime).module(define, name => {
            if (name === "wheat_plot") return Inspector.into(".viz")();
            if (name === "timeSeriesStyle") return Inspector.into('.viz')();
            if (name === "fontStyle") return Inspector.into('.viz')();
            if (name === "t") return true;
        });
    });

</script>

<span><br><br></span>



        <div class="svg-container">
            <div class="viz"></div>
        </div>





<style>
    .svg-container {
        display:flex;
      box-sizing: border-box;
    }
</style>
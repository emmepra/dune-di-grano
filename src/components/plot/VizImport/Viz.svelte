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
            if (name === "Chart1") return Inspector.into(".VizImport")();
            if (name === "") return Inspector.into(".VizImport")();
        });
    });

</script>

<span><br><br></span>

<div class="columns is-centered">
    <div class="column">
        <div class="VizImport"></div>

    </div>
</div>

<style>
</style>
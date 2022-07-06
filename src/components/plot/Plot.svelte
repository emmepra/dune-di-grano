<script>
    import {Runtime, Inspector} from "@observablehq/runtime";
    import plt from "./plot.js";

    import { onMount } from "svelte/internal";

    onMount(async () => {
        new Runtime().module(plt, name => {
        if (name === "chart") return new Inspector(document.querySelector("#observablehq-chart-d8e2dd59"));
        });

    });

    

</script>

<div class="test">
    <div id="observablehq-chart-d8e2dd59"></div>
</div>
<style>
.test {
    display: flex;
    justify-content: center;
}
</style>
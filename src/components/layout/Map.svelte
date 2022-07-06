<script>
    import { onMount } from "svelte/internal";

    // let Utils;

    onMount(async () => {
        document.getElementById("go").onload = function () { this.contentWindow.scrollTo(0, 200) };
    });

    let src = "./index.html";
</script>

<iframe id='go' width="100%" height="1000" src="https://emmepra.github.io/mapbox/" title="mapbox"></iframe>

<style>
iframe {
    display: block;
    background: #000;
    border: none;
    height: 100vh;
    width: 100vw;
}
</style>
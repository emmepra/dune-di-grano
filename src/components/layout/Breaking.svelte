<script>
    import Section from "$components/bulma/Section.svelte";
    // export let content = undefined;

    // let {author, text} = content;

    import { onMount } from 'svelte';

    onMount(() => {
        var blink_speed = 800; // every 1000 == 1 second, adjust to suit
        var t = setInterval(function () {
            var ele = document.getElementById('news');
            ele.style.visibility = (ele.style.visibility == 'hidden' ? '' : 'hidden');
        }, blink_speed);
    });

</script>

<!-- <Section bulma='p-3' id='quote'>
<section class="container">
    <div class="columns">
        <div class="column has-text-centered">
            <h1 class="title is-1 cap">•<mark><b> LIVE</b></mark></h1>
            <h1 class="title is-1 cap"><mark><b>BREAKING</b></mark></h1>
        </div>
    </div>
</section>
</Section> -->

<div class="columns is-centered mb-5">
    <div class="column is-breaking is-two-thirds">
        <h1 id="news" class="title is-1"><breaking><b>BREAKING NEWS</b></breaking></h1>
    </div>
</div>


<style lang='scss'>

    .title {
        margin-top:0 !important;
        line-height: 0 !important;

    }

    .is-breaking {
        background-color: var(--color-highlight);
        opacity: .8;
        padding: 0;

        // border-top: 1px solid #ff0;
        // outline: 2px solid var(--color-background);
        // outline-offset: -5px;
        outline: solid 4px var(--color-highlight);
        border-top: solid 2px var(--color-background); /* inner top border */
        border-bottom: solid 2px var(--color-background); /* inner top border */

    }

    h1 {
        font-family: var(--serif);
        font-weight: 400;
        color: var(--color-highlight);
    }

    h1 breaking {
        color: var(--color-background);
        font-family: var(--sans);
        font-size: 3rem;
        line-height: 1;

        padding-right: 0.2rem;
        padding-left: 0.1rem;
    }

</style>

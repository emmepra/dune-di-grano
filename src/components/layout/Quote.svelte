<script>
    import Section from "$components/bulma/Section.svelte"
    export let content = undefined

    let {author, text} = content
</script>

<Section bulma='p-3' id='quote'>
<section class="container">
    <div class="columns">
        <div class="column has-text-centered">
            <h1 class="title is-1 is-italic cap"><span>«</span>{text}<span>»</span></h1>
            {#if author.length !== 0}
                <p class="description">- {author}</p>
            {/if}
        </div>
    </div>
</section>
</Section>

<style lang='scss'>

    %pseudo-block {
        display: block;
        content: "";
        background: var(--color-highlight);
        height: 1px;
        width: 200px;
        opacity: 100%;
    }

    div.column {
        &:before {
            @extend %pseudo-block;
            margin: 2rem auto 3rem;
        }
        &:after {
            @extend %pseudo-block;
            margin: 3rem auto 2rem;
        }
    }

    h1 {
        font-family: var(--serif);
        font-weight: 400;
        color: var(--color-gray-medium);
    }

    h1 span {
        color: var(--color-highlight);
        font-family: var(--serif);
        font-size: 3rem;
        line-height: 1;

        padding-right: 0.2rem;
        padding-left: 0.1rem;
    }

    p.description {
        margin-bottom: 1rem;
        font-family: var(--sans);
        font-size: 1rem;
        line-height: 1.65;  
        color: var(--color-gray-medium)
    }

</style>

<script>
    import Section from "$components/bulma/Section.svelte"
    export let content = undefined

    let {author, text} = content
</script>

<Section bulma='' id='quote'>
<section class="container">
    <div class="columns">
        <div class="column has-text-centered">
            <h1 class="title is-1 is-italic cap"><span>«</span> {text} <span>»</span></h1>
            <p class="description">- {author}</p>
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
        color: gray;
    }

    h1 span {
        color: var(--color-highlight);
        font-family: var(--serif);
        font-size: 3rem;
        line-height: 1;

        padding-right: 0.2rem;
        padding-left: 0.1rem;
    }

</style>

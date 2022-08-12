<script>
  export let src = undefined;
  export let desc = '';
  export let place = '';
  export let bulma = '';
  //   export let id = undefined;
  //   export let style = undefined;
</script>

<!-- <div {id} class="card" style={style}>
  <div class="card-image">
    <figure class="image {bulma}">
      <slot />
    </figure>
  </div>
</div> -->

<div class="columns is-centered">
    <div class="column is-two-fifths {bulma}">
        <div class="card">
          <div class="card-image">
              <figure class="image is-4by3">
                  <img src={src} alt="">
              </figure>
          </div>
          <div class="card-content p-3">
                <p class='has-text-grey-darker m-0 mt-1 description'>{desc}</p>
                <p class='has-text-grey-darker m-0 description has-text-right'>{place}</p>
          </div>
        </div>        
    </div>
</div>

<style>
figcaption {
  display: block;
  background-color: black;
  color: white;
  font-style: italic;
  padding: 2px;
  text-align: center;
}
</style>
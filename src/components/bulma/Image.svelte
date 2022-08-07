<script>
  export let src = undefined;
  export let desc = '';
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
    <div class="column is-one-third {bulma}">
        <div class="card">
          <div class="card-image">
              <figure class="image is-4by3">
                  <img src={src} alt="">
              </figure>
          </div>
          <div class="card-content">
              <div class="content">
              <i>{desc}</i>
              <br>
              </div>
          </div>
        </div>        
    </div>
</div>
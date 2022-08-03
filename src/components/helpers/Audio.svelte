<script>
    import file from "$lib/assets/audio/suq_audio.mp3";

	import { tweened } from 'svelte/motion';
	let volume = tweened(1, { duration: 1000 });
    let setVol = 'Disattiva';

	async function tween(to) {
		volume.set(to);
	}
	let audio;
	$: if (audio) audio.volume = $volume;

    function changeVol(){
        if (setVol == 'Disattiva') {
            setVol = 'Attiva'
        } else {
            setVol = 'Disattiva'
        }
    }

</script>

<audio
	bind:this={audio}
	on:volumechange={({ target: { volume: v } }) => v !== $volume && ((audio.volume = $volume), ($volume = v))}
	src={file}
	autoplay
    loop
	type="audio/mp3" />

<div>
	<button on:click={() => tween($volume < 1 ? 1 : 0)} on:click={changeVol}> {setVol} Audio</button>
</div>

<style>
button {
  position:fixed;
  /* width:50%; */
  /* height:300px; */
  /* margin-left:40%; */
  bottom:0px;
  left:90%;
    background: whitesmoke;
    opacity: 0.85;
}
</style>
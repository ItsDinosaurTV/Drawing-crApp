<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	let color = 1;
	let tool = 'pen';

	const palette = [
		// SWEETIE 16 PALETTE
		'#1a1c2c',
		'#5d275d',
		'#b13e53',
		'#ef7d57',
		'#ffcd75',
		'#a7f070',
		'#38b764',
		'#257179',
		'#29366f',
		'#3b5dc9',
		'#41a6f6',
		'#73eff7',
		'#f4f4f4',
		'#94b0c2',
		'#566c86',
		'#333c57'
	];

	function handleSaveClick() {
		// TODO: Save

		dispatch('back');
	}

	let canvas: HTMLCanvasElement;

	onMount(async () => {
		var ctx = canvas.getContext('2d')!;
		ctx.moveTo(0, 0);
		ctx.lineTo(canvas.width, canvas.height);
		ctx.stroke();
	});
</script>

<!-- #region Palette -->
<div class="flex gap-1 overflow-y-hidden scrollbar-hide w-full">
	{#each Array(16) as _, i}
		<div class="btn-group">
			<button
				id="swatch-{i}"
				value={i}
				on:click={(_) => (color = i)}
				class="btn btn-outline border-gray-400 aspect-square {color === i
					? 'btn-active btn-accent'
					: ''}"
			>
				<div class="aspect-square rounded h-9" style="background-color:{palette[i]}" />
			</button>
		</div>
	{/each}
</div>
<!-- #endregion Palette -->
<div class="my-2">
	<canvas bind:this={canvas} width="128" height="128" class="w-full aspect-square" />
</div>

<!-- #region Utilities -->
<div class="flex gap-1">
	<div class="tooltip" data-tip="Undo">
		<button id="undo" class="btn">Undo</button>
	</div>
	<div class="tooltip" data-tip="Redo">
		<button id="redo" class="btn">Redo</button>
	</div>
	<div class="tooltip" data-tip="Clear">
		<button id="clear" class="btn">Clear</button>
	</div>
	<!-- #endregion Utilities -->

	<!-- #region Extra Utilities -->
	<div tabindex="0" class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
		<div class="collapse-title">More</div>

		<div class="collapse-content">
			<div class="tooltip" data-tip="Nudge up">
				<button id="nudge-up" class="btn">Up</button>
			</div>
			<div class="tooltip" data-tip="Nudge down">
				<button id="nudge-down" class="btn">Down</button>
			</div>
			<div class="tooltip" data-tip="Nudge left">
				<button id="nudge-left" class="btn">Left</button>
			</div>
			<div class="tooltip" data-tip="Nudge right">
				<button id="nudge-right" class="btn">Right</button>
			</div>
			<div class="tooltip" data-tip="Flip horizontally">
				<button id="flip-x" class="btn">Flip X</button>
			</div>
			<div class="tooltip" data-tip="Flip vertically">
				<button id="flip-y" class="btn">Flip Y</button>
			</div>
		</div>
	</div>
</div>
<!-- #endregion Extra Utilities -->

<!-- #region Tools -->
<div class="tooltip btn-group" data-tip="Pen">
	<input
		type="radio"
		id="pen"
		name="tools"
		bind:group={tool}
		data-title="Pen"
		value="pen"
		class="btn"
	/>
</div>

<div class="tooltip btn-group" data-tip="Brush">
	<input
		type="radio"
		id="brush"
		name="tools"
		bind:group={tool}
		data-title="Brush"
		value="brush"
		class="btn"
	/>
</div>

<div class="tooltip btn-group" data-tip="Eraser">
	<input
		type="radio"
		id="eraser"
		name="tools"
		bind:group={tool}
		data-title="Eraser"
		value="eraser"
		class="btn"
	/>
</div>

<div class="tooltip btn-group" data-tip="Replace">
	<input
		type="radio"
		id="replace"
		name="tools"
		bind:group={tool}
		data-title="Replace"
		value="replace"
		class="btn"
	/>
</div>

<div class="text-end mt-2">
	<button class="btn" on:click={handleSaveClick}>Save</button>
</div>

<!-- #endregion Tools -->

<!-- Old layout -->
{#if false}
	<!-- partial:index.partial.html -->
	<div class="full-page">
		<div class="panelToolbox">
			<div class="toolbox">
				<div class="undoredo">
					<div class="undo-button" id="undo">
						<h3>Undo</h3>
					</div>
					<div class="redo-button" id="redo">
						<h3>Redo</h3>
					</div>
				</div>
				<!--<div class="columns">-->
				<div class="tools">
					<!--<h4>Tools</h4>-->
					<div class="save-button" id="swapPalette">
						<h3>Swap Palette</h3>
					</div>
					<div class="tool" id="pencil">
						<h3>Pencil</h3>
					</div>
					<div class="tool" id="brush">
						<h3>Brush</h3>
					</div>
					<!--
    <div class="tool" id="replace">
        <h3>Replace</h3>
    </div>
        -->
					<div class="tool" id="eraser">
						<h3>Eraser</h3>
					</div>
					<div class="save-button" id="save">
						<h3>Save</h3>
					</div>
					<div onclick="openPopup()" class="save-button" id="submit">
						<h3>Submit</h3>
					</div>
					<!-- The popup panel -->
					<div id="popup" class="popup">
						<form>
							<label style="color: #ff4cd4;" for="charactername">Name:</label>
							<input type="text" id="charactername-input" name="charactername" />
							<br />
							<label style="color: #ff4cd4;" for="description">Personality:</label>
							<textarea id="description-input" name="description" />
							<br />
							<div class="save-button" id="submit-button"><h3>Submit</h3></div>
							<div onclick="closePopup()" class="save-button"><h3>Close</h3></div>
						</form>
					</div>
					<!--
    <div class="tool" id="line">
        <h3>Line</h3>
    </div>
    <div class="tool" id="fill">
        <h3>Fill</h3>
    </div>
    <div class="tool" id="picker">
        <h3>Picker</h3>
    </div>
    -->
				</div>
				<!--
                <div class="modes">
                    <h4>Modes</h4>
                    <div class="tool" id="save">
                        <h3>Save</h3>
                    </div>
                    <div class="tool">
                        layers
                            saved image wrong size
                            different settings for pencil/brush
                            keyboard commands
                            mobile interface
                            entire interface
                            are you sure you want to leave?
                        </div>-->
				<!-- Change to option instead -->
				<!--
                <div class="mode" id="draw">
                    <h3>Draw</h3>
                </div>
                <div class="mode" id="perfect">
                    <h3>Perfect</h3>
                </div>
                <div class="mode" id="noncont">
                    <h3>Non-Continuous</h3>
                </div>
                -->
				<!-- </div> -->
				<!-- Add option for continuous line -->
			</div>
			<!--</div>-->
		</div>
		<div class="main-container">
			<div class="panelPalette">
				<div class="palette" oncontextmenu="return false;">
					<div class="swatch" id="swatch0" />
					<div class="swatch" id="swatch1" />
					<div class="swatch" id="swatch2" />
					<div class="swatch" id="swatch3" />
					<div class="swatch" id="swatch4" />
					<div class="swatch" id="swatch5" />
					<div class="swatch" id="swatch6" />
					<div class="swatch" id="swatch7" />
					<div class="swatch" id="swatch8" />
					<div class="swatch" id="swatch9" />
					<div class="swatch" id="swatch10" />
					<div class="swatch" id="swatch11" />
					<div class="swatch" id="swatch12" />
					<div class="swatch" id="swatch13" />
					<div class="swatch" id="swatch14" />
					<div class="swatch" id="swatch15" />
				</div>
			</div>
			<div class="canvas-container" id="drawArea" oncontextmenu="return false;">
				<canvas id="onScreen">
					<!--width="128" height="128"-->
				</canvas>
			</div>
		</div>
	</div>

	<style src="./DrawCanvas.css"></style>
{/if}

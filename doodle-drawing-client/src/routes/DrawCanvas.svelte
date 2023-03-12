<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function handleBackClick() {
		dispatch('back');
	}
</script>

<button on:click={handleBackClick}>Back</button>
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

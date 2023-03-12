<form>
	<div class="border border-dashed rounded-lg h-52 mb-2 w-full flex justify-center items-center">
		<div>Click here to draw</div>
	</div>
	<div class="max-w-sm mx-auto">
		<input
			type="text"
			placeholder="Character Name"
			class="input input-bordered border-gray-400 w-full text-xl"
			maxlength="32"
		/>
	</div>
	<hr class="h-px my-1 bg-gray-200 border-0 dark:bg-gray-700" />
	<textarea
		class="textarea textarea-bordered border-gray-400 w-full max-h-80 leading-relaxed"
		placeholder="Describe the character's personality"
		maxlength="1024"
		rows="5"
	/>
	<div class="text-center">
		<button class="btn mx-auto" type="submit">Submit</button>
	</div>
</form>

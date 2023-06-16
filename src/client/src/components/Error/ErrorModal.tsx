import './ErrorModal.css'

export function ErrorModal(props: { error: string }) {
	let dialog = document.getElementById('dialog');
	let closeButton = document.getElementById('close');

	if (dialog !== null) {
		dialog.addEventListener('close', function onClose() {
			dialog?.removeEventListener('close', onClose);
			dialog = null;
		});
	}

	return (
		<dialog id="dialog" open>
			<p>{props.error}</p>
			<form method="dialog">
				<button id="close">X</button>
			</form>
		</dialog>
	)
}
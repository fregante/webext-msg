import {handleMessages, messageRuntime} from 'webext-msg';

handleMessages({
	async alert(message) {
		// eslint-disable-next-line no-alert
		alert(message);
	},
});

let clickCounter = 0;
document.addEventListener('click', async event => {
	if (clickCounter++ % 3) {
		console.log(
			'Background page says:',
			await messageRuntime({click: {clientX: event.clientX, clientY: event.clientY, url: location.href}}),
		);
	} else {
		await messageRuntime({throwError: 'Test error every 3 clicks'});
	}
});

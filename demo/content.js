import {handleMessages, messageRuntime} from 'webext-msg';

handleMessages({
	async alert(message) {
		// eslint-disable-next-line no-alert
		alert(message);
	},
});

let clickCounter = 0;
document.addEventListener('click', async event => {
	switch (clickCounter++ % 3) {
		case 0: {
			console.log(
				'Background page says asyncronously:',
				await messageRuntime({click: {clientX: event.clientX, clientY: event.clientY, url: location.href}}),
			);
			break;
		}

		case 1: {
			await messageRuntime({throwError: 'Test error every 3 clicks'});
			break;
		}

		default: {
			console.log(
				'Background page says synchronously:',
				await messageRuntime({sync: 'Test sync every 3 clicks'}));
			break;
		}
	}
});

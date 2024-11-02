import {handleMessages, messageTab} from 'webext-msg';

handleMessages({
	async click({clientX, clientY, url}, sender) {
		console.log('click', {clientX, clientY, url}, sender);
		return 'Click received at time ' + new Date().toString();
	},
	async throwError() {
		throw new Error('This is a test error');
	},
});

chrome.action.onClicked.addListener(tab => {
	messageTab(tab.id, {alert: 'How can she slap?'});
});

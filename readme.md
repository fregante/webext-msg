# webext-msg [![npm version](https://img.shields.io/npm/v/webext-msg.svg)](https://www.npmjs.com/package/webext-msg)

> WebExtension module: Simple message handler

- Browsers: Chrome, Firefox, Safari
- Manifest: v2 and v3
- Contexts: All contexts

Features:

- Promise-based API
- Avoids message handling boilerplate
- Suggests a simple messaging pattern
- Passes errors back to the sender

What it doesn't have:

- Type safety
- Complexity

It's very barebones and it's been in use by [Refined GitHub](https://github.com/refined-github/refined-github) for a long while.


## Install

You can download the [standalone bundle](https://bundle.fregante.com/?pkg=webext-msg&global=globalThis) and include it in your `manifest.json`.

Or use `npm`:

```sh
npm install webext-msg
```

## Usage

You can check the "demo" folder for a working example.

```js
import {handleMessages, messageRuntime, messageTab} from 'webext-msg';

// Set up the receiver, for example in background.js
handleMessages({
	// The first parameter is what the value sent as {openTab: VALUE}
	// The second parameter is always the message sender
	openTab: async (url, sender) => {
		const tab = await chrome.tabs.create({url});
		return tab.id
	},
	throwError: async () => {
		throw new Error('This is a test error');
	},
});


// Send a message to the background worker or other chrome-extension:// pages
const tabId = await messageRuntime({openTab: 'https://example.com'});
console.log({tabId});

await messageRuntime({throwError: null}); // This will throw an error in the current page

// Send a message from s Chrome extension page to a tab
messageTab(tabId, {alert: 'The background sends their regards'});
```

## Related

- [Awesome-WebExtensions](https://github.com/fregante/Awesome-WebExtensions) - A curated list of awesome resources for WebExtensions development.
- [More…](https://github.com/fregante/webext-fun)

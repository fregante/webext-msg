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

## API

### handleMessages(handlers)

Registers message handlers that listen to incoming messages from content scripts or extension pages.

#### handlers

Type: `Record<string, (messageValue: any, sender: chrome.runtime.MessageSender) => Promise<any>>`

An object of handler functions. Each key in the object is the message identifier, and the value is an `async` function (or a function returning a `Promise`) that receives:
- `messageValue`: The value sent under that key (e.g., `VALUE` in `{openTab: VALUE}`).
- `sender`: A `chrome.runtime.MessageSender` object.

Only the first matching key in the received message will trigger its handler. If a handler throws an error, the error is serialized and re-thrown on the sending side.

### messageRuntime(message)

Sends a message to the background script or other extension pages via `chrome.runtime.sendMessage`.

Returns a `Promise` resolving to the response from the handler. If the handler throws an error, this promise will reject with that error.

#### message

Type: `Record<string, unknown>`

An object representing the message. It should contain a key matching a handler registered with `handleMessages`.

### messageTab(tabId, message, options?)

Sends a message to a specific tab or content script via `chrome.tabs.sendMessage`.

Returns a `Promise` resolving to the response from the handler. If the handler throws an error, this promise will reject with that error.

#### tabId

Type: `number`

The ID of the tab to send the message to.

#### message

Type: `Record<string, unknown>`

An object representing the message. It should contain a key matching a handler registered with `handleMessages`.

#### options

Type: `chrome.tabs.SendMessageOptions` (optional)

Options object passed directly to `chrome.tabs.sendMessage`.

## Related

- [Awesome-WebExtensions](https://github.com/fregante/Awesome-WebExtensions) - A curated list of awesome resources for WebExtensions development.
- [More…](https://github.com/fregante/webext-fun)

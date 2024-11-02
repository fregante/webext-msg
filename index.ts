import {serializeError, deserializeError} from 'serialize-error';

/** They must return a promise to mark the message as handled */
export type MessageHandlers = Record<string, (...arguments_: any[]) => Promise<any>>;

export function handleMessages(handlers: MessageHandlers): void {
	chrome.runtime.onMessage.addListener((message: typeof handlers, sender, sendResponse): true | void => {
		for (const id of Object.keys(message)) {
			if (id in handlers) {
				(async () => {
					try {
						const result = await handlers[id]!(message[id], sender);
						sendResponse(result);
					} catch (error) {
						sendResponse({$$error: serializeError(error)});

						// Throw error in the current context too
						throw error;
					}
				})();

				// Chrome does not support returning a promise
				return true;
			}
		}
	});
}

function throwIfError(response: any): void {
	if (response?.$$error) {
		throw new Error(response.$$error.message, {
			cause: deserializeError(response.$$error),
		});
	}
}

export async function messageRuntime<Return>(message: Record<string, unknown>): Promise<Return> {
	const response = await chrome.runtime.sendMessage(message);
	throwIfError(response);
	return response;
}

export async function messageTab<Return>(...arguments_: Parameters<typeof chrome.tabs.sendMessage>): Promise<Return> {
	const response = await chrome.tabs.sendMessage(...arguments_);
	throwIfError(response);
	return response;
}

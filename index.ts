/**
They must return a promise to mark the message as handled
*/
export type MessageHandlers = Record<string, (...arguments_: any[]) => Promise<any>>;

async function call(function_: MessageHandlers[string], value: any, sender: chrome.runtime.MessageSender) {
	try {
		return await function_(value, sender);
	} catch (error) {
		// Throw error in the current context too
		reportError(error);

		// Reject the promise
		throw error;
	}
}

export function handleMessages(handlers: MessageHandlers): void {
	// eslint-disable-next-line @typescript-eslint/strict-void-return -- Incorrect types
	chrome.runtime.onMessage.addListener((message: typeof handlers, sender): Promise<any> | void => {
		for (const [id, value] of Object.entries(message)) {
			if (Object.hasOwn(handlers, id)) {
				// Call this way because the response MUST be a promise, even if the handler is synchronous
				return call(handlers[id]!, value, sender);
			}
		}
	});
}

export async function messageRuntime<Return>(message: Record<string, unknown>): Promise<Return> {
	return chrome.runtime.sendMessage(message);
}

export async function messageTab<Return>(...arguments_: [tabId: number, message: unknown, options?: chrome.tabs.MessageSendOptions]): Promise<Return> {
	return chrome.tabs.sendMessage(...arguments_);
}

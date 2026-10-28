/* eslint-disable @typescript-eslint/consistent-type-assertions -- Test mocks need assertions */
import {describe, it, type TestContext} from 'node:test';
import {handleMessages, messageRuntime, messageTab} from './index.ts';

type Listener = (message: Record<string, unknown>, sender: chrome.runtime.MessageSender) => Promise<unknown> | undefined;

const sender = {id: 'sender'} as chrome.runtime.MessageSender;

// Registers the handlers and returns the listener that `handleMessages` added to `onMessage`
function getListener(t: TestContext, handlers: Parameters<typeof handleMessages>[0]) {
	const addListener = t.mock.fn((_listener: Listener) => undefined);
	Object.assign(globalThis, {chrome: {runtime: {onMessage: {addListener}}}});
	handleMessages(handlers);

	t.assert.strictEqual(addListener.mock.callCount(), 1);
	return addListener.mock.calls[0]!.arguments[0];
}

describe('handleMessages', () => {
	it('should call the matching handler with the value and the sender', async (t: TestContext) => {
		const handler = t.mock.fn(async (_value: unknown, _sender: chrome.runtime.MessageSender) => 'result');
		const listener = getListener(t, {greet: handler});

		const response = listener({greet: {name: 'Ada'}}, sender);

		t.assert.ok(response instanceof Promise);
		t.assert.strictEqual(await response, 'result');
		t.assert.deepStrictEqual(handler.mock.calls.map(call => call.arguments), [[{name: 'Ada'}, sender]]);
	});

	it('should ignore messages without a handler', (t: TestContext) => {
		const handler = t.mock.fn(async () => 'result');
		const listener = getListener(t, {greet: handler});

		t.assert.strictEqual(listener({unknown: 1}, sender), undefined);
		t.assert.strictEqual(handler.mock.callCount(), 0);
	});

	it('should not call inherited properties as handlers', (t: TestContext) => {
		const listener = getListener(t, {});

		t.assert.strictEqual(listener({toString: 1}, sender), undefined);
	});

	it('should only call the first matching handler', async (t: TestContext) => {
		const first = t.mock.fn(async () => 'first');
		const second = t.mock.fn(async () => 'second');
		const listener = getListener(t, {first, second});

		t.assert.strictEqual(await listener({second: 1, first: 1}, sender), 'second');
		t.assert.strictEqual(first.mock.callCount(), 0);
		t.assert.strictEqual(second.mock.callCount(), 1);
	});

	it('should reject and report the error when the handler fails', async (t: TestContext) => {
		const error = new Error('Nope');
		const reportError = t.mock.fn((_error: unknown) => undefined);
		Object.assign(globalThis, {reportError});
		const listener = getListener(t, {
			async fail() {
				throw error;
			},
		});

		await t.assert.rejects(async () => listener({fail: 1}, sender), error);
		t.assert.deepStrictEqual(reportError.mock.calls.map(call => call.arguments), [[error]]);
	});
});

describe('messageRuntime', () => {
	it('should send the message to the runtime and return the response', async (t: TestContext) => {
		const sendMessage = t.mock.fn(async (_message: unknown) => 'response');
		Object.assign(globalThis, {chrome: {runtime: {sendMessage}}});

		t.assert.strictEqual(await messageRuntime({greet: 1}), 'response');
		t.assert.deepStrictEqual(sendMessage.mock.calls.map(call => call.arguments), [[{greet: 1}]]);
	});
});

describe('messageTab', () => {
	it('should send the message to the tab and return the response', async (t: TestContext) => {
		const sendMessage = t.mock.fn(async (..._arguments: unknown[]) => 'response');
		Object.assign(globalThis, {chrome: {tabs: {sendMessage}}});

		t.assert.strictEqual(await messageTab(5, {greet: 1}, {frameId: 2}), 'response');
		t.assert.deepStrictEqual(sendMessage.mock.calls.map(call => call.arguments), [[5, {greet: 1}, {frameId: 2}]]);
	});

	it('should not pass the options when they are omitted', async (t: TestContext) => {
		const sendMessage = t.mock.fn(async (..._arguments: unknown[]) => 'response');
		Object.assign(globalThis, {chrome: {tabs: {sendMessage}}});

		await messageTab(5, {greet: 1});
		t.assert.deepStrictEqual(sendMessage.mock.calls.map(call => call.arguments), [[5, {greet: 1}]]);
	});
});

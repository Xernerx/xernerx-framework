/** @format */

import { EventBuilder } from '../build/EventBuilder.js';

/**
 * Built-in process `message` event listener used for inter-process communication with `XernerxShardClient`.
 */
export class XernerxMessageEvent extends EventBuilder {
	/**
	 * Constructs the `XernerxMessageEvent` listener on the Node.js `process` emitter.
	 */
	constructor() {
		super('XernerxMessage', {
			name: 'message',
			emitter: 'process',
			once: false,
		});
	}

	/**
	 * Handles an incoming IPC message sent to the process.
	 *
	 * @param message - The IPC message payload containing a `type` discriminator and optional `data`.
	 * @returns A promise that resolves once the IPC message has been inspected.
	 */
	override async run(message: { type: string; data: Record<string, number> }) {
		if (message.type !== 'xernerx') return;
	}
}

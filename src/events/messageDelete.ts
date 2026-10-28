/** @format */

import { Message } from 'discord.js';

import { EventBuilder } from '../build/EventBuilder.js';
import { XernerxUser } from '../model/XernerxUser.js';
import { MessageUtil } from '../util/MessageUtil.js';

/**
 * Built-in `messageDelete` event listener that deletes cached bot responses when
 * the triggering command message is deleted and `handleDeletions` is enabled.
 */
export class XernerxMessageDeleteEvent extends EventBuilder {
	/**
	 * Constructs the `XernerxMessageDeleteEvent` listener.
	 */
	constructor() {
		super('XernerxMessageDeleteEvent', {
			name: 'messageDelete',
			emitter: 'client',
			once: false,
		});
	}

	/**
	 * Handles a deleted Discord message and removes the corresponding cached command response if applicable.
	 *
	 * @param message - The deleted Discord message.
	 * @returns A promise that resolves when deletion handling completes.
	 */
	override async run(message: Message) {
		message.user = new XernerxUser(message.client, message.author);

		message.util = new MessageUtil(this.client as Message['client'], message);

		if (!this.client.handler.message.handleDeletions) return;

		if (!this.client.cache.messages.has(message.id)) return;

		const id = this.client.cache.messages.get(message.id);

		if (!id) return;

		try {
			const msg = await message.channel.messages.fetch(id);

			await msg.delete();
		} catch (error) {
			await this.client.emit('commandDelete', message, error as Error);
		}
	}
}

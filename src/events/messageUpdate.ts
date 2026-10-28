/** @format */

import { Message } from 'discord.js';

import { EventBuilder } from '../build/EventBuilder.js';
import { XernerxUser } from '../model/XernerxUser.js';
import { MessageUtil } from '../util/MessageUtil.js';

/**
 * Built-in `messageUpdate` event listener that re-evaluates and updates bot responses
 * when a message command is edited.
 */
export class XernerxMessageUpdateEvent extends EventBuilder {
	/**
	 * Constructs the `XernerxMessageUpdateEvent` listener.
	 */
	constructor() {
		super('XernerxMessageUpdateEvent', {
			name: 'messageUpdate',
			emitter: 'client',
			once: false,
		});
	}

	/**
	 * Handles an updated Discord message and re-executes the matching message command if applicable.
	 *
	 * @param oldMessage - The message state prior to the edit.
	 * @param message - The updated Discord message.
	 * @returns A promise that resolves when the edited message command finishes executing.
	 */
	override async run(oldMessage: Message, message: Message) {
		message.user = new XernerxUser(message.client, message.author);

		message.util = new MessageUtil(this.client as Message['client'], message);

		if (!message.content) return;
		if (this.client.handler.message.ignore?.bots && message.author.bot) return;
		if (this.client.handler.message.ignore?.self && message.author.id === this.client.user?.id) return;
		if (this.client.handler.message.ignore?.system && message.system) return;

		if (!message.util.parsed.command) return;

		const command = this.client.commands.message.get(message.util.parsed.command);

		if (!command) return;

		if (
			this.client.handler.message.mention &&
			!message.util.parsed.mention &&
			!command?.prefix.includes(message.util.parsed.prefix as string) &&
			!this.client.handler.message.prefix?.includes(message.util.parsed.prefix as string)
		)
			return;

		// validation

		// args

		// inhibitors

		try {
			await message.client.emit('commandStart', message, {}, command);

			await command?.exec(message, message.util.args);

			await message.client.emit('commandFinish', message, {}, command);
		} catch (error) {
			await message.client.emit('commandError', message, {}, command, error as Error);
		}
	}
}

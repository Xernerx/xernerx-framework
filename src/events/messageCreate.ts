/** @format */

import { Message } from 'discord.js';

import { EventBuilder } from '../build/EventBuilder.js';
import { XernerxUser } from '../model/XernerxUser.js';
import { MessageUtil } from '../util/MessageUtil.js';
import { BaseValidator } from '../validators/BaseValidator.js';

/**
 * Built-in `messageCreate` event listener that parses message commands, hydrates
 * `message.user` (`XernerxUser`) and `message.util` (`MessageUtil`), validates requirements,
 * and executes matching message commands.
 */
export class XernerxMessageCreateEvent extends EventBuilder {
	/**
	 * Constructs the `XernerxMessageCreateEvent` listener.
	 */
	constructor() {
		super('XernerxMessageCreateEvent', {
			name: 'messageCreate',
			emitter: 'client',
			once: false,
		});
	}

	/**
	 * Processes a newly created Discord message and executes any matching message command.
	 *
	 * @param message - The incoming Discord message.
	 * @returns A promise that resolves when message command execution completes.
	 */
	override async run(message: Message) {
		message.user = new XernerxUser(message.client, message.author);

		message.util = new MessageUtil(this.client as Message['client'], message);

		if (!message.content) return;
		if (this.client.handler.message.ignore?.bots && message.author.bot) return;
		if (this.client.handler.message.ignore?.self && message.author.id === this.client.user?.id) return;
		if (this.client.handler.message.ignore?.system && message.system) return;

		if (!message.util.parsed.command) return;

		const command = this.client.commands.message.get(message.util.parsed.command);

		if (!command) return;

		await message.user.fetchEngagement();

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

			const validation = new BaseValidator(message, command);

			if (!(await validation.validate())) return;

			await command?.exec(message, message.util.args);

			await message.client.emit('commandFinish', message, {}, command);
		} catch (error) {
			await message.client.emit('commandError', message, {}, command, error as Error);
		}
	}
}

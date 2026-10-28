/** @format */

import { MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from 'discord.js';
import { EventBuilder } from '../build/EventBuilder.js';
import { ContextCommandOptions } from '../interfaces/ContextCommandOptions.js';
import { XernerxUser } from '../model/XernerxUser.js';
import { ContextCommandValidator } from '../validators/ContextCommandValidator.js';
import { InhibitorValidator } from '../validators/InhibitorValidator.js';

/**
 * Built-in event listener for `contextCommandInteraction` that validates, defers,
 * and executes user and message context menu commands.
 */
export class XernerxContextCommandInteractionEvent extends EventBuilder {
	/**
	 * Constructs the `XernerxContextCommandInteractionEvent` listener.
	 */
	constructor() {
		super('xernerxContextCommandInteraction', {
			name: 'contextCommandInteraction',
			emitter: 'client',
			once: false,
		});
	}

	/**
	 * Handles an incoming user or message context menu command interaction.
	 *
	 * @param interaction - The Discord user or message context menu command interaction.
	 * @returns A promise that resolves when the context menu command finishes executing.
	 */
	override async run(interaction: UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction) {
		const command = this.client.commands.context.get(interaction.commandName);

		if (!command) return;

		let options = { interaction } as ContextCommandOptions<'user'> | ContextCommandOptions<'message'>;

		if (interaction.isUserContextMenuCommand()) {
			(options as ContextCommandOptions<'user'>).user = await new XernerxUser(this.client, interaction.targetUser).fetchEngagement();
		}

		if (interaction.isMessageContextMenuCommand()) {
			(options as ContextCommandOptions<'message'>).message = interaction.targetMessage;
		}

		const inhibitor = new InhibitorValidator(interaction.client);

		if (await inhibitor.pre('command', interaction, command)) return;

		try {
			await this.client.emit('commandStart', interaction, options, command);

			const validation = new ContextCommandValidator(interaction, command);

			if (!(await validation.validate())) return;

			if (command.defer) await interaction.deferReply();

			if (await command.conditions(options)) return;

			await command.exec(options);

			await inhibitor.post('command', interaction, command);
			await this.client.emit('commandFinish', interaction, options, command);
		} catch (error) {
			await this.client.emit('commandError', interaction, options, command, error as Error);
		}
	}
}

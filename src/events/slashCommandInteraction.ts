/** @format */

import { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';

import { EventBuilder } from '../build/EventBuilder.js';
import { InteractionArguments } from '../model/InteractionArguments.js';
import { SlashCommandValidator } from '../validators/SlashCommandValidator.js';
import { InhibitorValidator } from '../validators/InhibitorValidator.js';

/**
 * Built-in event listener for `slashCommandInteraction` that handles autocomplete,
 * runs inhibitors and validators, formats options, and executes slash commands.
 */
export class XernerxSlashCommandInteractionEvent extends EventBuilder {
	/**
	 * Constructs the `XernerxSlashCommandInteractionEvent` listener.
	 */
	constructor() {
		super('XernerxSlashCommandInteractionEvent', {
			name: 'slashCommandInteraction',
			emitter: 'client',
			once: false,
		});
	}

	/**
	 * Handles an incoming chat input (slash) command interaction.
	 *
	 * @param interaction - The Discord chat input command interaction.
	 * @returns A promise that resolves when the slash command finishes processing.
	 */
	override async run(interaction: ChatInputCommandInteraction) {
		const command = this.client.commands.slash.get(interaction.commandName);

		if (!command) return;

		const inhibitor = new InhibitorValidator(interaction.client);

		if (await inhibitor.pre('command', interaction, command)) return;

		new Promise(async (resolve) => {
			if (interaction.isAutocomplete()) {
				const focused = (interaction as AutocompleteInteraction).options.getFocused(true);
				const options = (interaction as AutocompleteInteraction).options;

				await command.autocomplete({ interaction, focused, options });
			} else resolve(true);
		}).then(async () => {
			const args = new InteractionArguments(interaction, command);
			const options = { options: args.options(), subcommand: args.subcommand(), group: args.group() };

			try {
				await this.client.emit('commandStart', interaction, options, command);

				const validation = new SlashCommandValidator(interaction, command);

				if (!(await validation.validate())) return;

				if (command.defer) await interaction.deferReply();

				if (await command.conditions({ interaction, ...options, command })) return;

				await command.exec({ interaction, ...options, command });

				await this.client.emit('commandFinish', interaction, options, command);

				await inhibitor.post('command', interaction, command);
			} catch (error) {
				await command.error({ interaction, ...options, command, error: error as Error });

				await this.client.emit('commandError', interaction, options, command, error as Error);
			}
		});
	}
}

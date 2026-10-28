/** @format */

import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '../build/SlashCommandBuilder.js';
import { SlashCommandOption } from '../main.js';

/**
 * Helper class that extracts and formats slash command options, subcommands, and subcommand groups
 * from a `ChatInputCommandInteraction`.
 */
export class InteractionArguments {
	declare private readonly interaction: ChatInputCommandInteraction;
	declare private readonly command: SlashCommandBuilder;

	/**
	 * Constructs a new `InteractionArguments` parser for an interaction and command.
	 *
	 * @param interaction - The Discord chat input command interaction.
	 * @param command - The `SlashCommandBuilder` instance being executed.
	 */
	constructor(interaction: ChatInputCommandInteraction, command: SlashCommandBuilder) {
		this.interaction = interaction;

		this.command = command;
	}

	/**
	 * Retrieves the options from the current interaction based on the command structure.
	 *
	 * This method processes the command's groups, subcommands, and options to extract
	 * the relevant options from the interaction. It returns a record of option names
	 * and their corresponding values from the interaction.
	 *
	 * @returns {Record<string, any> | null} A record of option names and values if available, otherwise null.
	 */
	options() {
		const options: Record<string, SlashCommandOption> = {};

		if (this.command.groups) {
			const group = this.command.groups.find((group) => group.name === this.group());

			if (!group) return options;

			const subcommand = group.subcommands.find((subcommand) => subcommand.name === this.subcommand());

			if (!subcommand) return options;

			if (subcommand?.options) this.formatOptions(subcommand?.options, options);
		}

		if (this.command.subcommands) {
			const subcommand = this.command.subcommands.find((subcommand) => subcommand.name === this.subcommand());

			if (!subcommand) return options;

			if (subcommand?.options) this.formatOptions(subcommand?.options, options);
		}

		if (this.command.options) {
			this.formatOptions(this.command.options, options);
		}

		return options;
	}

	/**
	 * Populates the target `options` record with resolved values and entities from the interaction options.
	 *
	 * @param input - Array of option definitions configured on the command or subcommand.
	 * @param options - Mutable record where formatted option objects are stored by name.
	 */
	formatOptions(input: any, options: any) {
		for (const option of input) {
			const o = this.interaction.options.get(option.name);

			if (!o) continue;

			const optionName = { 3: 'string', 4: 'number', 5: 'boolean', 6: 'user', 7: 'channel', 8: 'role', 9: 'mentionable', 10: 'integer', 11: 'attachment' } as const;

			options[option.name] = {
				name: o.name,
				type: optionName[o.type as keyof typeof optionName],
				value: o.value,
			};

			if (o.user) options[option.name].user = o.user;
			if (o.channel) options[option.name].channel = o.channel;
			if (o.role) options[option.name].role = o.role;
			if (o.attachment) options[option.name].attachment = o.attachment;
		}
	}

	/**
	 * Retrieves the name of the subcommand from the current interaction.
	 *
	 * This method attempts to extract the subcommand name from the interaction options.
	 * If no subcommand is present or an error occurs, it returns null.
	 *
	 * @returns {string | null} The name of the subcommand if available, otherwise null.
	 */
	subcommand() {
		try {
			return this.interaction.options.getSubcommand();
		} catch {
			return null;
		}
	}

	/**
	 * Retrieves the name of the subcommand group from the current interaction.
	 *
	 * This method attempts to extract the subcommand group name from the interaction options.
	 * If no subcommand group is present or an error occurs, it returns null.
	 *
	 * @returns {string | null} The name of the subcommand group if available, otherwise null.
	 */
	group() {
		try {
			return this.interaction.options.getSubcommandGroup();
		} catch {
			return null;
		}
	}
}

/** @format */

import { BaseValidator } from './BaseValidator.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '../build/SlashCommandBuilder.js';

/**
 * Validator for chat input (slash) command interactions.
 */
export class SlashCommandValidator extends BaseValidator {
	/**
	 * Constructs a new `SlashCommandValidator` instance.
	 *
	 * @param interaction - The chat input command interaction.
	 * @param command - The `SlashCommandBuilder` instance being validated.
	 */
	constructor(interaction: ChatInputCommandInteraction, command: SlashCommandBuilder) {
		super(interaction, command);
	}
}

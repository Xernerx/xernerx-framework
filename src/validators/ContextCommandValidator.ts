/** @format */

import { MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from 'discord.js';

import { BaseValidator } from './BaseValidator.js';
import { ContextCommandBuilder } from '../build/ContextCommandBuilder.js';

/**
 * Validator for user and message context menu command interactions.
 */
export class ContextCommandValidator extends BaseValidator {
	/**
	 * Constructs a new `ContextCommandValidator` instance.
	 *
	 * @param interaction - The user or message context menu command interaction.
	 * @param command - The `ContextCommandBuilder` instance being validated.
	 */
	constructor(interaction: UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction, command: ContextCommandBuilder) {
		super(interaction, command);
	}
}

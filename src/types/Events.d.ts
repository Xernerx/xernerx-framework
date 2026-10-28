/** @format */

import 'discord.js';

import { MessageCommandBuilder } from '../build/MessageCommandBuilder.ts';
import { SlashCommandBuilder } from '../build/SlashCommandBuilder.ts';
import { ContextCommandBuilder } from '../build/ContextCommandBuilder.ts';

declare module 'discord.js' {
	interface ClientEvents {
		selectMenuInteraction: [interaction: AnySelectMenuInteraction];
		buttonInteraction: [interaction: ButtonInteraction];
		modalInteraction: [interaction: ModalSubmitInteraction];
		contextCommandInteraction: [interaction: ContextMenuCommandInteraction];
		slashCommandInteraction: [interaction: ChatInputCommandInteraction];
		commandError: [interaction: Interaction | Message, args: any, command: SlashCommandBuilder | MessageCommandBuilder | ContextCommandBuilder, error: Error];
		commandBlock: [interaction: Interaction | Message, command: SlashCommandBuilder | MessageCommandBuilder | ContextCommandBuilder, error: any];
		commandStart: [interaction: Interaction | Message, args: any, command: SlashCommandBuilder | MessageCommandBuilder | ContextCommandBuilder];
		commandFinish: [interaction: Interaction | Message, args: any, command: SlashCommandBuilder | MessageCommandBuilder | ContextCommandBuilder];
		commandDelete: [interaction: Interaction | Message, error: Error];
		vote: [payload: any, user?: any];
		review: [payload: any, user?: any];
		tip: [payload: any, user?: any];
		release: [payload: any, user?: any];
		stat: [payload: any, user?: any];
		test: [payload: any, user?: any];
		webhook: [payload: any, user?: any];
	}
}

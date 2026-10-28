/** @format */

import { Message, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from 'discord.js';

import { ContextCommandBuilder } from '../build/ContextCommandBuilder.js';
import { XernerxUser } from '../model/XernerxUser.js';

/**
 * Base options passed to a context menu command execution or condition method.
 */
export type BaseOptions = {
	/** The `ContextCommandBuilder` instance being executed. */
	command: ContextCommandBuilder;
};

/**
 * Execution payload passed to `ContextCommandBuilder.exec` and `ContextCommandBuilder.conditions`,
 * narrowed by whether the context menu targets a `'user'` or a `'message'`.
 */
export type ContextCommandOptions<T extends 'message' | 'user'> = T extends 'user'
	? BaseOptions & {
			/** The Discord user context menu command interaction. */
			interaction: UserContextMenuCommandInteraction;
			/** The target user wrapped in `XernerxUser` with hydrated engagement data. */
			user: XernerxUser;
		}
	: BaseOptions & {
			/** The Discord message context menu command interaction. */
			interaction: MessageContextMenuCommandInteraction;
			/** The target Discord `Message` of the context menu interaction. */
			message: Message;
		};

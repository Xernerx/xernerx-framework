/** @format */

import { Message, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from 'discord.js';

import { ContextCommandBuilder } from '../build/ContextCommandBuilder.js';
import { XernerxUser } from '../model/XernerxUser.js';

export type BaseOptions = {
	command: ContextCommandBuilder;
};

export type ContextCommandOptions<T extends 'message' | 'user'> = T extends 'user'
	? BaseOptions & {
			interaction: UserContextMenuCommandInteraction;
			user: XernerxUser;
		}
	: BaseOptions & {
			interaction: MessageContextMenuCommandInteraction;
			message: Message;
		};

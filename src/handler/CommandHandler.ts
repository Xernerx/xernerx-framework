/** @format */

import { BaseHandler } from './BaseHandler.js';
import { ContextCommandHandlerOptions } from '../interfaces/ContextCommandHandlerOptions.js';
import { MessageCommandHandlerOptions } from '../interfaces/MessageCommandHandlerOptions.js';
import { SlashCommandHandlerOptions } from '../interfaces/SlashCommandHandlerOptions.js';
import { XernerxClient } from '../client/XernerxClient.js';
import { XernerxContextCommandInteractionEvent } from '../events/contextCommandInteraction.js';
import { XernerxError } from '../tools/XernerxError.js';
import { XernerxInteractionCreateEvent } from '../events/interactionCreate.js';
import { XernerxMessageCreateEvent } from '../events/messageCreate.js';
import { XernerxMessageDeleteEvent } from '../events/messageDelete.js';
import { XernerxMessageUpdateEvent } from '../events/messageUpdate.js';
import { XernerxSlashCommandInteractionEvent } from '../events/slashCommandInteraction.js';
import { XernerxSuccess } from '../tools/XernerxSuccess.js';
import { XernerxWarn } from '../tools/XernerxWarn.js';
import sharpyy from 'sharpyy';
import { z } from 'zod';

/**
 * Handler responsible for loading and initializing message commands, slash commands,
 * and context menu commands along with their built-in interaction/message listeners.
 */
export class CommandHandler extends BaseHandler {
	/**
	 * Constructs a new `CommandHandler` instance.
	 *
	 * @param client - The `XernerxClient` instance to register commands onto.
	 */
	constructor(client: XernerxClient) {
		super(client);
	}

	/**
	 * Loads a message command from a specified file.
	 *
	 * @param file - The path to the file containing the message command to be loaded.
	 * @returns A promise that resolves when the file has been successfully loaded.
	 */
	public async loadMessageCommand(file: string) {
		return await this.loadFile(file);
	}

	/**
	 * Loads message commands based on the provided options.
	 *
	 * @param options - Configuration options for loading message commands, including directory, prefix, mention, separator, handleEdits, handleDeletions, and ignore settings.
	 * @returns A promise that resolves when all message commands have been successfully loaded.
	 */
	public async loadMessageCommands(options: MessageCommandHandlerOptions) {
		const config = z
			.object({
				directory: z.string(),
				prefix: z.union([z.string(), z.array(z.string())]).default([]),
				mention: z.boolean().default(false),
				seperator: z.string().default(' '),
				handleEdits: z.boolean().default(false),
				handleDeletions: z.boolean().default(false),
				ignore: z
					.object({
						system: z.boolean().default(true),
						bots: z.boolean().default(true),
						self: z.boolean().default(true),
					})
					.default({ system: true, bots: true, self: true }),
			})
			.parse(options);

		typeof config.prefix == 'string' ? (config.prefix = [config.prefix]) : config.prefix;

		this.client.handler.message = config;

		const files = this.loadFiles(config.directory);

		this.loadBuilder(XernerxMessageCreateEvent, XernerxMessageUpdateEvent, XernerxMessageDeleteEvent);

		if (!this.client.options.intents.has('GuildMessages')) new XernerxError(`Missing ${sharpyy('GuildMessages', 'txYellow')} intent, message commands will not work.`);
		if (!this.client.options.intents.has('MessageContent') && !config.mention)
			new XernerxError(`Missing ${sharpyy('MessageContent', 'txYellow')} intent and bot mention is turned off, message commands will not work.`);
		if (!this.client.options.intents.has('MessageContent') && config.mention)
			new XernerxWarn(`Missing ${sharpyy('MessageContent', 'txYellow')} intent, message commands can only be triggered by @mention.`);

		for (const file of files) {
			await this.loadMessageCommand(file);
		}

		new XernerxSuccess(`Loaded message commands: ${this.client.commands.message.map((command) => sharpyy(command.id, 'txYellow')).join(', ')}`);
	}

	/**
	 * Loads a slash command from a specified file.
	 *
	 * @param file - The path to the file containing the slash command to be loaded.
	 * @returns A promise that resolves when the file has been successfully loaded.
	 */
	public async loadSlashCommand(file: string) {
		return await this.loadFile(file);
	}

	/**
	 * Loads slash commands based on the provided options.
	 *
	 * @param options - Configuration options for loading slash commands, including the directory where the command files are located.
	 * @returns A promise that resolves when all slash commands have been successfully loaded.
	 */
	public async loadSlashCommands(options: SlashCommandHandlerOptions) {
		const config = z
			.object({
				directory: z.string(),
			})
			.parse(options);

		this.client.handler.slash = config;

		const files = this.loadFiles(config.directory);

		for (const file of files) {
			await this.loadSlashCommand(file);
		}

		this.loadBuilder(XernerxInteractionCreateEvent, XernerxSlashCommandInteractionEvent);

		new XernerxSuccess(`Loaded slash commands: ${this.client.commands.slash.map((command) => sharpyy(command.id, 'txYellow')).join(', ')}`);
	}

	/**
	 * Loads a single context menu command from a specified file.
	 *
	 * @param file - The path to the file containing the context menu command to be loaded.
	 * @returns A promise that resolves when the file has been successfully loaded.
	 */
	public async loadContextCommand(file: string) {
		return await this.loadFile(file);
	}

	/**
	 * Loads all context menu commands from the configured directory and registers the required interaction listeners.
	 *
	 * @param options - Configuration options for loading context menu commands, including the directory path.
	 * @returns A promise that resolves when all context menu commands have been successfully loaded.
	 */
	public async loadContextCommands(options: ContextCommandHandlerOptions) {
		const config = z
			.object({
				directory: z.string(),
			})
			.parse(options);

		this.client.handler.context = config;

		const files = this.loadFiles(config.directory);

		for (const file of files) {
			await this.loadContextCommand(file);
		}

		this.loadBuilder(XernerxInteractionCreateEvent, XernerxContextCommandInteractionEvent);

		new XernerxSuccess(`Loaded context commands: ${this.client.commands.context.map((command) => sharpyy(command.id, 'txYellow')).join(', ')}`);
	}
}

/** @format */

import { ContextCommandBuilder } from '../main.js';
import { EventBuilder } from '../build/EventBuilder.js';
import { InhibitorBuilder } from '../build/InhibitorBuilder.js';
import { MessageCommandBuilder } from '../build/MessageCommandBuilder.js';
import { SlashCommandBuilder } from '../build/SlashCommandBuilder.js';
import { XernerxClient } from '../client/XernerxClient.js';
import { XernerxError } from '../tools/XernerxError.js';
/** @format */
import fs from 'fs';
import path from 'path';

/**
 * Base handler class responsible for discovering, importing, and registering
 * builder modules (events, commands, inhibitors, and extensions) on `XernerxClient`.
 */
export class BaseHandler {
	/** The `XernerxClient` instance managed by this handler. */
	declare public readonly client: XernerxClient;
	[index: string]: Record<string, any>;

	/**
	 * Constructs a new `BaseHandler` instance.
	 *
	 * @param client - The `XernerxClient` instance to register modules onto.
	 */
	constructor(client: XernerxClient) {
		this.client = client;
	}

	/**
	 * Loads JavaScript files from a specified directory.
	 *
	 * @param dir - The directory path from which to load the files.
	 * @returns An array of file paths for JavaScript files in the specified directory.
	 *          Returns an empty array if an error occurs during the file reading process.
	 */
	protected loadFiles(dir: string) {
		try {
			return fs
				.readdirSync(dir)
				.filter((file) => file.endsWith('.js'))
				.map((file) => path.join(dir, file));
		} catch (error) {
			new XernerxError((error as Error).message, 0);

			return [];
		}
	}

	/**
	 * Asynchronously loads a JavaScript file and imports its default export.
	 *
	 * @param file - The path to the JavaScript file to be loaded.
	 * @returns A promise that resolves when the file is successfully loaded and imported.
	 *          If the file does not have a default export, an error is thrown.
	 */
	protected async loadFile(file: string) {
		const filepath = path.resolve(file);
		const filename = path.basename(filepath);

		try {
			const file = await import(`file://${filepath}`);

			if (!file.default) return new XernerxError(`${filename} | ${file} does not have a default export.`, 0);

			const builder = new file.default(this.client);

			builder.filepath = filepath;
			builder.filename = filename;

			this.importFile(builder);
		} catch (error) {
			new XernerxError(`${filename} | ${(error as Error).message}`, 0);
		}
	}

	/**
	 * Imports a file by registering it with the client based on its type.
	 *
	 * @param builder - An instance of XernerxEventBuilder, XernerxMessageCommandBuilder, or XernerxSlashCommandBuilder.
	 *                  This object contains the necessary information to register the file with the client.
	 * @param filename - An optional string representing the name of the file being imported.
	 *                   Used for error reporting if the builder ID is not unique.
	 * @returns The builder object after it has been registered with the client.
	 *          If the builder is of type XernerxEvent, it is registered as an event listener.
	 *          If the builder is of type XernerxMessageCommand or XernerxSlashCommand, it is registered as a command.
	 */
	protected async importFile(builder: EventBuilder | MessageCommandBuilder | SlashCommandBuilder | ContextCommandBuilder | InhibitorBuilder, filename?: string) {
		if (!filename) filename = builder.id;

		builder.client = this.client;

		if (builder.filetype === 'XernerxEvent') {
			if (this.client.events.has(builder.id)) {
				if (!builder.id.startsWith('Xernerx')) return new XernerxError(`${filename} | ID must be unique`);

				return;
			}

			this.client.events.set(builder.id, builder);

			this.process = process;

			if (!this[builder.emitter] && !(this.client as Record<string, any>)[builder.emitter])
				return new XernerxError(`${filename} | ${builder.emitter} does not exist on client, make sure you add it to the root client.`);

			if (!this[builder.emitter]) this[builder.emitter] = (this.client as Record<string, any>)[builder.emitter];

			if (this[builder.emitter])
				builder.once
					? this[(builder as EventBuilder).emitter].once(builder.name, <T extends []>(...args: T) => builder.run(...(args as [])))
					: this[(builder as EventBuilder).emitter].on(builder.name, <T extends []>(...args: T) => builder.run(...(args as [])));
		}

		if (builder.filetype === 'XernerxMessageCommand') {
			if (this.client.commands.message.has(builder.id)) return new XernerxError(`${filename} | ID must be unique`);

			this.client.commands.message.set(builder.id, builder);
		}

		if (builder.filetype === 'XernerxSlashCommand') {
			if (this.client.commands.slash.has(builder.id)) return new XernerxError(`${filename} | ID must be unique`);

			this.client.commands.slash.set(builder.id, builder);
		}

		if (builder.filetype === 'XernerxContextCommand') {
			if (this.client.commands.slash.has(builder.id)) return new XernerxError(`${filename} | ID must be unique`);

			this.client.commands.context.set(builder.id, builder);
		}

		if (builder.filetype === 'XernerxInhibitor') {
			if (this.client.inhibitors.has(builder.id)) return new XernerxError(`${filename} | ID must be unique`);

			this.client.inhibitors.set(builder.id, builder);
		}

		return builder;
	}

	/**
	 * Instantiates and imports one or more built-in `EventBuilder` classes onto the client.
	 *
	 * @param builders - Array of `EventBuilder` constructors to instantiate and register.
	 * @returns A promise that resolves when all builders have been imported.
	 */
	protected async loadBuilder(...builders: Array<typeof EventBuilder>) {
		for (const builder of builders) {
			this.importFile(new builder('', { name: '' }));
		}
	}
}

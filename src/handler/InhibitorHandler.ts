/** @format */

import { BaseHandler } from './BaseHandler.js';
import { InhibitorHandlerOptions } from '../interfaces/InhibitorHandlerOptions.js';
import { XernerxClient } from '../client/XernerxClient.js';
import { XernerxSuccess } from '../tools/XernerxSuccess.js';
import sharpyy from 'sharpyy';

/**
 * Handler responsible for loading interaction and command inhibitors from a directory.
 */
export class InhibitorHandler extends BaseHandler {
	/**
	 * Constructs a new `InhibitorHandler` instance.
	 *
	 * @param client - The `XernerxClient` instance to register inhibitors onto.
	 */
	constructor(client: XernerxClient) {
		super(client);
	}

	/**
	 * Loads a single inhibitor from a specified file.
	 *
	 * @param file - The path to the inhibitor file to be loaded.
	 * @returns A promise that resolves when the inhibitor file has been loaded.
	 */
	async loadInhibitor(file: string) {
		return await this.loadFile(file);
	}

	/**
	 * Loads all inhibitor files from the configured directory.
	 *
	 * @param options - Configuration options specifying the directory containing inhibitor files.
	 * @returns A promise that resolves when all inhibitors have been loaded.
	 */
	async loadInhibitors(options: InhibitorHandlerOptions) {
		const files = this.loadFiles(options.directory);

		for (const file of files) {
			await this.loadInhibitor(file);
		}

		new XernerxSuccess(`Loaded inhibitors: ${this.client.inhibitors.map((inhibitor) => sharpyy(inhibitor.id, 'txYellow')).join(', ')}`);
	}
}

/** @format */

import { ExtensionBuilder } from '@xernerx/extension-builder';
import { BaseHandler } from './BaseHandler.js';
import { XernerxClient } from '../client/XernerxClient.js';
import { XernerxSuccess } from '../tools/XernerxSuccess.js';
import sharpyy from 'sharpyy';
import { XernerxError } from '../tools/XernerxError.js';

/**
 * Handler responsible for registering framework extensions (built with `@xernerx/extension-builder`,
 * such as `@xernerx/commands`, `@xernerx/stats`, and `@xernerx/hooks`) onto `XernerxClient`.
 */
export class ExtensionHandler extends BaseHandler {
	/**
	 * Constructs a new `ExtensionHandler` instance.
	 *
	 * @param client - The `XernerxClient` instance to register extensions onto.
	 */
	constructor(client: XernerxClient) {
		super(client);
	}

	/**
	 * Validates and registers a single extension builder instance onto the client.
	 *
	 * @param builder - The extension instance to validate and attach to `client.extensions`.
	 * @returns A promise that resolves when the extension is registered, or logs an error if invalid.
	 */
	protected override async loadBuilder(builder: ExtensionBuilder | any): Promise<any> {
		if (!builder || (!(builder instanceof ExtensionBuilder) && (!builder.id || builder.filetype !== 'XernerxExtension'))) {
			return new XernerxError(`${builder?.name || builder?.constructor?.name || 'Unknown'} is not a valid extension.`);
		}

		builder.client = this.client;

		this.client.extensions.set(builder.id || builder.name, builder);
	}

	/**
	 * Loads a single framework extension instance.
	 *
	 * @param builder - The extension instance to load.
	 * @returns A promise that resolves when the extension has been loaded.
	 */
	async loadExtension(builder: ExtensionBuilder | any) {
		return await this.loadBuilder(builder);
	}

	/**
	 * Loads multiple framework extension instances and logs a summary upon completion.
	 *
	 * @param builders - One or more extension instances to load onto the client.
	 * @returns A promise that resolves when all extensions have been loaded.
	 */
	async loadExtensions(...builders: Array<ExtensionBuilder | any>) {
		for (const builder of builders) {
			await this.loadExtension(builder);
		}

		new XernerxSuccess(`Loaded extensions: ${this.client.extensions.map((extension) => sharpyy(extension.id, 'txYellow')).join(', ')}`);
	}
}

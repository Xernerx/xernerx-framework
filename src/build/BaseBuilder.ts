/** @format */

import { ContextCommandBuilderOptions } from '../interfaces/ContextCommandBuilderOptions.js';
import { EventBuilderOptions } from '../interfaces/EventBuilderOptions.js';
import { InhibitorBuilderOptions } from '../interfaces/InhibitorBuilderOptions.js';
import { SlashCommandBuilderOptions } from '../interfaces/SlashCommandBuilderOptions.js';
import { XernerxClient } from '../client/XernerxClient.js';

/**
 * Base class for all Xernerx builders (events, commands, and inhibitors).
 */
export class BaseBuilder {
	/** The `XernerxClient` instance associated with this builder. */
	declare public client: XernerxClient;

	/**
	 * Constructs a new instance of the XernerxBaseBuilder class.
	 *
	 * @param id - A unique identifier for the builder instance.
	 * @param options - Configuration options for the builder, which can be either
	 *                  XernerxSlashCommandBuilderOptions or XernerxEventBuilderOptions.
	 */
	constructor(
		/** Unique identifier for this builder instance. */
		public readonly id: string,
		options: SlashCommandBuilderOptions | EventBuilderOptions | ContextCommandBuilderOptions | InhibitorBuilderOptions
	) {
		this.id = id;
	}
}

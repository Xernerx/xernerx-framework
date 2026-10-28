/** @format */

import { BaseBuilder } from './BaseBuilder.js';
import { InhibitorBuilderOptions } from '../interfaces/InhibitorBuilderOptions.js';

/**
 * Builder class for defining pre- and post-execution inhibitors for interactions or commands.
 */
export class InhibitorBuilder extends BaseBuilder {
	/** The target lifecycle stage this inhibitor intercepts (`'interaction'` or `'command'`). */
	declare public readonly name: InhibitorBuilderOptions['name'];

	/** Static discriminator identifying this builder as a Xernerx inhibitor. */
	declare public readonly filetype: 'XernerxInhibitor';

	/**
	 * Constructs a new `InhibitorBuilder` instance.
	 *
	 * @param id - A unique identifier for the inhibitor.
	 * @param options - Configuration options specifying the inhibitor target (`'interaction'` or `'command'`).
	 */
	constructor(id: string, options: InhibitorBuilderOptions) {
		super(id, options);

		this.name = options.name;

		this.filetype = 'XernerxInhibitor';
	}

	/**
	 * Hook executed before the target interaction or command runs.
	 * Returning a truthy value blocks further execution of the interaction or command.
	 *
	 * @param args - Arguments passed to the inhibitor (e.g., `[interaction]` or `[interaction, command]`).
	 * @returns A promise resolving to a truthy value to block execution, or falsy/void to allow it.
	 */
	async pre(...args: any): Promise<any> {}

	/**
	 * Hook executed after the target interaction or command completes.
	 *
	 * @param args - Arguments passed to the inhibitor (e.g., `[interaction]` or `[interaction, command]`).
	 * @returns A promise resolving when post-processing is complete.
	 */
	async post(...args: any): Promise<any> {}
}

/** @format */

import { BaseBuilder } from './BaseBuilder.js';
import { ClientEvents } from 'discord.js';
import { EventBuilderOptions } from '../interfaces/EventBuilderOptions.js';
import { XernerxWarn } from '../tools/XernerxWarn.js';
import sharpyy from 'sharpyy';

/**
 * Builder class for defining Discord client events, process events, or custom emitter events (such as `@xernerx/hooks`).
 */
export class EventBuilder extends BaseBuilder {
	/** Static discriminator identifying this builder as a Xernerx event. */
	declare public readonly filetype: 'XernerxEvent';
	/** The name of the event to listen for. */
	declare public readonly name: ClientEvents | keyof ClientEvents | (string & {});
	/** The name of the event emitter on the client or handler (defaults to `'client'`). */
	declare public readonly emitter: string;
	/** Whether the event listener should only trigger once. */
	declare public readonly once: boolean;

	/**
	 * Constructs a new `EventBuilder` instance.
	 *
	 * @param id - A unique identifier for the event.
	 * @param options - Configuration options for the event, including name, emitter, and once behavior.
	 */
	constructor(id: string, options: EventBuilderOptions) {
		super(id, options);

		this.filetype = 'XernerxEvent';

		this.name = options.name;

		this.emitter = options.emitter ?? 'client';

		this.once = options.once ?? false;
	}

	/**
	 * Executes the event logic. This method should be overridden in subclasses to provide specific event handling.
	 *
	 * @param args - A variable number of arguments that are passed to the event handler.
	 *               These arguments are specific to the event being handled.
	 * @returns A promise that resolves when the event handling is complete.
	 *          The resolved value can be any type, depending on the implementation in subclasses.
	 */
	public async run(...args: any[]): Promise<any | void> {
		new XernerxWarn(`Event ${sharpyy(`${this.id}`, 'txYellow')} does not have a run method, and will therefore not work.`);
	}
}

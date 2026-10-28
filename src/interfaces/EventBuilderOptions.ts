/** @format */

import { ClientEvents } from 'discord.js';

/**
 * Configuration options for defining an event listener with `EventBuilder`.
 */
export interface EventBuilderOptions {
	/** The event name to listen for on the target emitter. */
	name: ClientEvents | keyof ClientEvents | (string & {});
	/** The emitter property name on the client or handler (defaults to `'client'`, or e.g. `'hooks'`, `'process'`). */
	emitter?: string;
	/** Whether the listener should only be invoked once and then removed. */
	once?: boolean;
}

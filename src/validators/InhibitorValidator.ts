/** @format */

import { XernerxClient } from '../main.js';

/**
 * Validator that invokes registered `InhibitorBuilder` pre- and post-execution hooks for interactions and commands.
 */
export class InhibitorValidator {
	/**
	 * Constructs a new `InhibitorValidator` instance.
	 *
	 * @param client - The `XernerxClient` instance holding registered inhibitors.
	 */
	constructor(
		/** The `XernerxClient` instance holding registered inhibitors. */
		public client: XernerxClient
	) {
		this.client = client;
	}

	/**
	 * Executes the `pre` hook on the inhibitor matching `name`, if registered.
	 *
	 * @param name - The inhibitor name/type to execute (e.g., `'interaction'` or `'command'`).
	 * @param args - Arguments forwarded to the inhibitor's `pre` method.
	 * @returns A promise resolving to the inhibitor's return value (truthy blocks execution).
	 */
	async pre(name: string, ...args: any) {
		if (!this.client.inhibitors.has(name)) return;

		const inhibitor = this.client.inhibitors.get(name);

		return await inhibitor?.pre(...args);
	}

	/**
	 * Executes the `post` hook on the inhibitor matching `name`, if registered.
	 *
	 * @param name - The inhibitor name/type to execute (e.g., `'interaction'` or `'command'`).
	 * @param args - Arguments forwarded to the inhibitor's `post` method.
	 * @returns A promise resolving to the inhibitor's `post` return value.
	 */
	async post(name: string, ...args: any) {
		if (!this.client.inhibitors.has(name)) return;

		const inhibitor = this.client.inhibitors.get(name);

		return await inhibitor?.post(...args);
	}
}

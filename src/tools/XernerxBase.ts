/** @format */

import { terminal, Terminal } from '@xernerx/terminal';

/** Shared `@xernerx/terminal` logger instance scoped to `'XF'`. */
export const t = terminal.child({ scope: 'XF' });

/**
 * Base terminal logging utility class used across the Xernerx framework.
 */
export class XernerxBase {
	[index: string]: unknown;
	/** The scoped `@xernerx/terminal` logger instance. */
	public readonly terminal: Terminal = t;

	/**
	 * Constructs a new `XernerxBase` logger instance and copies any global `process.xernerx` metadata onto it.
	 */
	constructor() {
		// @ts-expect-error
		const x = process.xernerx;

		if (x)
			for (const [key, value] of Object.entries(x)) {
				this[key] = value;
			}
	}

	/**
	 * Returns the formatted terminal prefix string.
	 *
	 * @returns The formatted prefix from `@xernerx/terminal`.
	 */
	public base() {
		return t.prefix();
	}
}

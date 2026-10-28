/** @format */

import { XernerxBase, t } from './XernerxBase.js';

/**
 * Terminal logging helper that outputs a warning message.
 */
export class XernerxWarn extends XernerxBase {
	/**
	 * Logs a warning message to the terminal.
	 *
	 * @param message - The warning message to log.
	 */
	constructor(message: string) {
		super();

		t.warn(message);
	}
}

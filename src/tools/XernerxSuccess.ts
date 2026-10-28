/** @format */

import { XernerxBase, t } from './XernerxBase.js';

/**
 * Terminal logging helper that outputs a success message.
 */
export class XernerxSuccess extends XernerxBase {
	/**
	 * Logs a success message to the terminal.
	 *
	 * @param message - The success message to log.
	 */
	constructor(message: string) {
		super();

		t.succeed(message);
	}
}

/** @format */

import { XernerxBase, t } from './XernerxBase.js';

/**
 * Terminal logging helper that outputs an informational message.
 */
export class XernerxInfo extends XernerxBase {
	/**
	 * Logs an informational message to the terminal.
	 *
	 * @param message - The informational message to log.
	 */
	constructor(message: string) {
		super();

		t.info(message);
	}
}

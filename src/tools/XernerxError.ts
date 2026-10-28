/** @format */

import sharpyy from 'sharpyy';

import { XernerxBase, t } from './XernerxBase.js';

/**
 * Terminal logging helper that outputs a red error message and optionally exits the process.
 */
export class XernerxError extends XernerxBase {
	/**
	 * Logs an error message to the terminal and optionally terminates the Node.js process.
	 *
	 * @param message - The error message to log.
	 * @param exit - Optional process exit code; if non-zero, `process.exit(exit)` is called.
	 */
	constructor(message: string, exit: number = 0) {
		super();

		t.error(sharpyy(message, 'txRed'));

		exit ? process.exit(exit) : null;
	}
}

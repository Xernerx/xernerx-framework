/** @format */

import sharpyy from 'sharpyy';

import { XernerxBase, t } from './XernerxBase.js';

type GlobalErrorReporter = (payload: { message: string; stack?: string | null; level?: 'error' | 'warn' | 'fatal' }) => void;

let activeErrorReporter: GlobalErrorReporter | null = null;

/**
 * Registers an internal error reporter hook invoked whenever {@link XernerxError} is constructed.
 * @param reporter - Callback that dispatches the error to the Xernerx WebSocket gateway.
 */
export function registerXernerxErrorReporter(reporter: GlobalErrorReporter) {
	activeErrorReporter = reporter;
}

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

		if (activeErrorReporter) {
			try {
				const stack = new Error(message).stack || null;
				activeErrorReporter({
					message,
					stack,
					level: exit ? 'fatal' : 'error',
				});
			} catch {}
		}

		exit ? process.exit(exit) : null;
	}
}

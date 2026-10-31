/** @format */

import { XernerxBase, t } from './XernerxBase.js';
import pkg from '../../package.json' with { type: 'json' };

/**
 * Terminal initialization helper that displays the Xernerx banner and checks for newer framework versions.
 */
export class XernerxInitial extends XernerxBase {
	/**
	 * Clears the terminal, renders the `XERNERX` banner, and initiates an asynchronous version check.
	 *
	 * @param type - Whether the process is starting a standalone `'Client'` or a `'ShardClient'`.
	 */
	constructor(type: 'Client' | 'ShardClient') {
		super();

		t.clear();
		t.box('XERNERX');
		t.start(type == 'Client' ? 'Starting...' : 'Sharding...');

		void this.version();
	}

	/**
	 * Delegates to `@xernerx/terminal`'s unified `update()` checker to inspect all installed Xernerx packages
	 * against the npm registry and log a single consolidated update list if newer versions are available.
	 */
	async version(): Promise<void> {
		await t.update({ name: pkg.name, version: pkg.version });
	}
}

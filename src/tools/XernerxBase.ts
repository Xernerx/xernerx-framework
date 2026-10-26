/** @format */

import { terminal, Terminal } from '@xernerx/terminal';

export const t = terminal.child({ scope: 'XF' });

export class XernerxBase {
	[index: string]: unknown;
	public readonly terminal: Terminal = t;

	constructor() {
		// @ts-expect-error
		const x = process.xernerx;

		if (x)
			for (const [key, value] of Object.entries(x)) {
				this[key] = value;
			}
	}

	public base() {
		return t.prefix();
	}
}

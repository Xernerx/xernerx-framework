/** @format */

import sharpyy from 'sharpyy';

import { XernerxBase, t } from './XernerxBase.js';

export class XernerxError extends XernerxBase {
	constructor(message: string, exit: number = 0) {
		super();

		t.error(sharpyy(message, 'txRed'));

		exit ? process.exit(exit) : null;
	}
}

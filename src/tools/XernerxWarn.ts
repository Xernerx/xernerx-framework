/** @format */

import { XernerxBase, t } from './XernerxBase.js';

export class XernerxWarn extends XernerxBase {
	constructor(message: string) {
		super();

		t.warn(message);
	}
}

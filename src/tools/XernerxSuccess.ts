/** @format */

import { XernerxBase, t } from './XernerxBase.js';

export class XernerxSuccess extends XernerxBase {
	constructor(message: string) {
		super();

		t.succeed(message);
	}
}

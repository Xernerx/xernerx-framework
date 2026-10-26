/** @format */

import { XernerxBase, t } from './XernerxBase.js';

export class XernerxInfo extends XernerxBase {
	constructor(message: string) {
		super();

		t.info(message);
	}
}

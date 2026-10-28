/** @format */

import { XernerxBase, t } from './XernerxBase.js';
import fs from 'fs';
import path from 'path';
import pkg from '../../package.json' with { type: 'json' };
import { XernerxInfo } from './XernerxInfo.js';

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

		this.version();
	}

	/**
	 * Checks the official Xernerx repository for newer stable or beta releases and logs an update notice if available.
	 *
	 * @returns A promise that resolves to an info log instance if an update is available, or `undefined`.
	 */
	async version() {
		const latest = (await fetch('https://api.github.com/repos/Xernerx/docs/contents/packages/xernerx')
			.then((res) => res.json())
			.catch(() => null)) as unknown as Array<{ type: string; name: string }> | null;
		const project = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf-8'));

		if (!latest || !Array.isArray(latest)) return;

		const versions = latest.filter((file) => file.type === 'dir').map((file) => file.name);

		if (project.dependencies?.xernerx?.includes('beta')) {
			const betas = versions.filter((version) => version.includes('beta'));

			const version = betas[betas.length - 1];

			if (!version) return;

			if (version !== pkg.version)
				return new XernerxInfo(
					`New beta version available: ${version}, your current version is ${pkg.version}\nRun 'npm install xernerx@${version}' to install.\nChanges: https://app.xernerx.com/docs`
				);
		} else {
			const stables = versions.filter((version) => !version.includes('beta'));

			const version = stables[stables.length - 1];

			if (!version) return;

			const [stableMajor, stableMinor, stablePatch] = version.split('.').map((part) => parseInt(part));
			const [currentMajor, currentMinor, currentPatch] = pkg.version.split('.').map((part) => parseInt(part));

			if (stableMajor > currentMajor)
				return new XernerxInfo(
					`New major version available: ${version}, your current version is ${pkg.version}\nRun 'npm install xernerx@${version}' to install. Check for breaking changes before upgrading!\nChanges: https://app.xernerx.com/docs`
				);
			if (stableMajor == currentMajor && stableMinor > currentMinor)
				return new XernerxInfo(
					`New minor version available: ${version}, your current version is ${pkg.version}\nRun 'npm install xernerx@${version}' to install. Check for breaking changes before upgrading!\nChanges: https://app.xernerx.com/docs`
				);
			if (stableMajor == currentMajor && stableMinor == currentMinor && stablePatch > currentPatch)
				return new XernerxInfo(
					`New patch version available: ${version}, your current version is ${pkg.version}\nRun 'npm install xernerx@${version}' to install. Check for breaking changes before upgrading!\nChanges: https://app.xernerx.com/docs`
				);
		}
	}
}

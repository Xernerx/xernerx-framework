/** @format */

import { BaseGuild, Client } from 'discord.js';

/**
 * Extended Discord guild model providing helpers for guild-level entitlements and monetization.
 */
export class XernerxGuild extends BaseGuild {
	/**
	 * Constructs a new `XernerxGuild` instance.
	 *
	 * @param client - The authenticated Discord `Client` instance.
	 * @param guild - The base Discord guild object to wrap.
	 */
	constructor(client: Client<true>, guild: BaseGuild) {
		super(client, guild as any);
	}

	/**
	 * Consumes a consumable entitlement for this guild.
	 */
	consumeEntitlement() {}

	/**
	 * Retrieves the entitlements associated with this guild.
	 */
	entitlements() {}
}

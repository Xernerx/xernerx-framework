/** @format */

import { BaseGuild, Client } from 'discord.js';
import { XernerxClient } from '../client/XernerxClient.js';
import { XernerxMonitisation } from './XernerxMonitisation.js';

/**
 * Extended Discord guild model providing helpers for guild-level entitlements and monetization.
 */
export class XernerxGuild extends BaseGuild {
	private readonly monitisation: XernerxMonitisation;

	/**
	 * Constructs a new `XernerxGuild` instance.
	 *
	 * @param client - The authenticated Discord `Client` instance.
	 * @param guild - The base Discord guild object to wrap.
	 */
	constructor(client: Client<true>, guild: BaseGuild) {
		super(client, guild as any);

		this.monitisation = new XernerxMonitisation(client);
	}

	/**
	 * Checks if this guild has any active (non-ended, non-consumed) entitlements, indicating guild premium status.
	 *
	 * @param skuId - Optional SKU ID or array of SKU IDs to filter by.
	 * @returns A promise resolving to `true` if the guild holds an active matching entitlement, or `false` otherwise.
	 */
	async premium(skuId?: string | Array<string>): Promise<boolean> {
		const skuIds = Array.isArray(skuId) ? skuId.filter(Boolean).join(',') : skuId?.trim();
		const entitlements = await this.monitisation.entitlements({
			guild_id: this.id,
			exclude_ended: true,
			...(skuIds ? { sku_ids: skuIds } : {}),
		});

		const now = Date.now();
		const active = entitlements.filter((entitlement) => !entitlement.deleted && !entitlement.consumed && (!entitlement.ends_at || Date.parse(entitlement.ends_at) > now));

		return active.length > 0;
	}

	/**
	 * Consumes a consumable entitlement for this guild.
	 *
	 * @param id - The unique identifier of the entitlement to consume.
	 * @returns A promise that resolves when the entitlement has been consumed.
	 */
	async consumeEntitlement(id: string) {
		return this.monitisation.consume(id);
	}

	/**
	 * Retrieves the entitlements associated with this guild and maps them to their corresponding SKU.
	 *
	 * @param excludeEnded - Whether to exclude expired entitlements (defaults to `true`).
	 * @returns A promise resolving to an array of `{ entitlement, sku }` pairs for this guild.
	 */
	async entitlements(excludeEnded = true) {
		const entitlements = await this.monitisation.entitlements({ guild_id: this.id, exclude_ended: excludeEnded });

		const xClient = this.client as unknown as XernerxClient;
		const SKU = xClient.monitisation?.skus?.length ? xClient.monitisation.skus : await this.monitisation.sku();

		return entitlements.map((entitlement) => ({ entitlement, sku: SKU.find((sku) => sku.id === entitlement.sku_id) }));
	}
}

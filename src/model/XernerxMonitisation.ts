/** @format */

import { MonetizationAPI } from '@discordjs/core';
import { Client, RequestData, RESTGetAPIEntitlementsQuery, SKUFlags } from 'discord.js';

/**
 * Wrapper around `@discordjs/core`'s `MonetizationAPI` bound to the current application client,
 * providing methods to query SKUs and manage or consume user/guild entitlements.
 */
export class XernerxMonitisation extends MonetizationAPI {
	declare private readonly client: Client<true>;

	/**
	 * Constructs a new `XernerxMonitisation` API wrapper.
	 *
	 * @param client - The authenticated Discord `Client` instance.
	 */
	constructor(client: Client<true>) {
		super(client.rest);

		this.client = client;
	}

	/**
	 * Consumes an entitlement for the current user.
	 *
	 * @param id - The unique identifier of the entitlement to be consumed.
	 * @param options - Optional request options specifying authentication or signaling method.
	 * @returns A promise that resolves when the entitlement is successfully consumed.
	 */
	consume(id: string, options?: Pick<RequestData, 'auth' | 'signal'>) {
		return this.consumeEntitlement(this.client.user.id, id, options);
	}

	/**
	 * Retrieves entitlements for the current user.
	 *
	 * @param id - An optional query object to filter entitlements.
	 * @param options - Optional request options specifying authentication or signaling method.
	 * @returns A promise that resolves with the entitlements for the current user.
	 */
	entitlements(id?: RESTGetAPIEntitlementsQuery, options?: Pick<RequestData, 'auth' | 'signal'>) {
		return this.getEntitlements(this.client.user.id, id || {}, options);
	}

	/**
	 * Retrieves the Stock Keeping Units (SKUs) for the current user.
	 *
	 * @param options - Optional request options specifying authentication or signaling method.
	 * @returns A promise that resolves with the SKUs for the current user.
	 */
	sku(options?: Pick<RequestData, 'auth' | 'signal'>) {
		return this.getSKUs(this.client.user.id, options);
	}

	/**
	 * Creates a test entitlement for a specified user or guild and SKU.
	 *
	 * @param id - The unique identifier of the SKU for which the entitlement is to be created.
	 * @param ownerId - The unique identifier of the user or guild that will own the entitlement.
	 * @param ownerType - Optional explicit owner type (`1` for guild subscription, `2` for user subscription). Inferred from `sku.flags` when omitted.
	 * @returns A promise that resolves with the created test entitlement, or `undefined` if the SKU is not found.
	 */
	async create(id: string, ownerId: string, ownerType?: 1 | 2) {
		const skus = await this.sku();

		const sku = skus.find((s) => s.id === id);

		if (!sku) return;

		const resolvedOwnerType = ownerType ?? ((sku.flags & SKUFlags.GuildSubscription) !== 0 ? 1 : 2);

		return await this.createTestEntitlement(this.client.user.id, { owner_id: ownerId, owner_type: resolvedOwnerType, sku_id: id });
	}

	/**
	 * Deletes a test entitlement for the current user.
	 *
	 * @param id - The unique identifier of the test entitlement to be deleted.
	 * @returns A promise that resolves when the test entitlement is successfully deleted.
	 */
	delete(id: string) {
		return this.deleteTestEntitlement(this.client.user.id, id);
	}
}

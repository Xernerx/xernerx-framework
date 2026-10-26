/** @format */

import { Client, EntitlementType, SKUType, User } from 'discord.js';

import { XernerxMonitisation } from './XernerxMonitisation.js';
import { XernerxClient } from '../client/XernerxClient.js';

export class XernerxUser extends User {
	private readonly monitisation: XernerxMonitisation;

	constructor(client: Client<true> | XernerxClient, user: User) {
		super(client as Client<true>, user as any);

		this.monitisation = new XernerxMonitisation(client as Client<true>);
	}

	/**
	 * Checks if the user has any entitlements, indicating premium status.
	 *
	 * @param id - The ID of the user to check for premium entitlements.
	 * @returns A promise that resolves to a boolean indicating whether the user has any entitlements (true) or not (false).
	 */
	async premium(id: string) {
		const entitlements = await this.monitisation.entitlements({ user_id: this.id });

		if (!entitlements.length) return false;
		return true;
	}

	/**
	 * Retrieves the entitlements for the user and maps them to their corresponding SKU.
	 *
	 * @returns A promise that resolves to an array of objects, each containing an entitlement and its associated SKU.
	 */
	async entitlements() {
		const entitlements = await this.monitisation.entitlements({ user_id: this.id });

		const SKU = await this.monitisation.sku();

		return entitlements.map((entitlement) => ({ entitlement: entitlement, sku: SKU.find((sku) => sku.id === entitlement.sku_id) }));
	}

	/**
	 * Synchronizes the user's entitlements with the current SKU data and performs necessary actions
	 * such as consuming, deleting, or creating entitlements based on their type and the client's premium settings.
	 *
	 * @returns A promise that resolves to an array of error messages, if any occurred during the synchronization process.
	 */
	async synchronize() {
		const errors: Array<string> = [];
		const client = this.client as XernerxClient;
		const skus = await this.monitisation.sku();
		const entitlements = await this.monitisation.entitlements({ user_id: this.id });

		for (const entitlement of entitlements) {
			if (!client.premium.synchronize) continue;

			const sku = skus.find((sku) => sku.id === entitlement.sku_id);

			if (!sku) continue;

			if (sku.type == SKUType.Consumable && !entitlement.consumed && client.premium.consume) this.monitisation.consume(entitlement.id).catch((e) => errors.push(e.message));

			if (sku.type == SKUType.Durable) {
			}

			if (sku.type == SKUType.Subscription && entitlement.type == EntitlementType.ApplicationSubscription) this.monitisation.delete(entitlement.id).catch((e) => errors.push(e.message));

			if (sku.type == SKUType.SubscriptionGroup && entitlement.type == EntitlementType.ApplicationSubscription) this.monitisation.delete(entitlement.id).catch((e) => errors.push(e.message));
		}

		for (const sku of skus) {
			if (!client.premium.owners) continue;

			if (sku.type == 5) {
				await this.monitisation.create(sku.id, this.id).catch((e) => errors.push(e.message));
			}
		}

		return errors;
	}
}

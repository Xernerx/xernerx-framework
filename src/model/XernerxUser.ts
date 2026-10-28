/** @format */

import { Client, EntitlementType, SKUType, User } from 'discord.js';

import { XernerxMonitisation } from './XernerxMonitisation.js';
import { XernerxClient } from '../client/XernerxClient.js';

/**
 * Extended Discord `User` model attached to interactions and messages (`interaction.user`, `message.user`)
 * with built-in Discord monetization helpers and Xernerx engagement state (`voted`, `reviewed`, `tipped`).
 */
export class XernerxUser extends User {
	private readonly monitisation: XernerxMonitisation;
	/** Whether the user currently has an active vote for this bot on Xernerx. */
	public voted = false;
	/** ISO timestamp of when the user last voted for this bot, or `null` if never. */
	public lastVotedAt: string | null = null;
	/** ISO timestamp of when the user's current vote expires and they can vote again, or `null`. */
	public nextVoteAt: string | null = null;
	/** Whether the user has left a review for this bot on Xernerx. */
	public reviewed = false;
	/** The review rating score left by the user, or `null` if no review exists. */
	public rating: number | null = null;
	/** Total credits tipped by the user to this bot on Xernerx. */
	public tipped = 0;

	/**
	 * Constructs a new `XernerxUser` instance and hydrates engagement fields from the client's in-memory cache if available.
	 *
	 * @param client - The `XernerxClient` or Discord `Client` instance.
	 * @param user - The base Discord `User` object to wrap.
	 */
	constructor(client: Client<true> | XernerxClient, user: User) {
		super(client as Client<true>, user as any);

		this.monitisation = new XernerxMonitisation(client as Client<true>);

		const xClient = client as XernerxClient;
		const botId = xClient.user?.id || '';
		const cached = (botId ? xClient.userEngagementCache?.get(`${botId}:${this.id}`) : undefined) || xClient.userEngagementCache?.get(this.id);

		if (cached) {
			if (cached.voted && cached.nextVoteAt && Date.now() >= Date.parse(cached.nextVoteAt)) {
				cached.voted = false;
			}
			this.voted = Boolean(cached.voted);
			this.lastVotedAt = cached.lastVotedAt ?? null;
			this.nextVoteAt = cached.nextVoteAt ?? null;
			this.reviewed = Boolean(cached.reviewed);
			this.rating = cached.rating ?? null;
			this.tipped = typeof cached.tipped === 'number' ? cached.tipped : 0;
		}
	}

	/**
	 * Hydrates `voted`, `reviewed`, and `tipped` from the client's engagement cache or the Xernerx API.
	 *
	 * @param force - Whether to bypass the in-memory TTL cache and fetch fresh engagement data from the API.
	 * @returns A promise that resolves to this `XernerxUser` instance with updated engagement properties.
	 */
	async fetchEngagement(force = false): Promise<this> {
		const xClient = this.client as XernerxClient;
		if (typeof xClient.resolveUserEngagement === 'function') {
			const data = await xClient.resolveUserEngagement(this.id, force);
			this.voted = Boolean(data.voted);
			this.lastVotedAt = data.lastVotedAt ?? null;
			this.nextVoteAt = data.nextVoteAt ?? null;
			this.reviewed = Boolean(data.reviewed);
			this.rating = data.rating ?? null;
			this.tipped = typeof data.tipped === 'number' ? data.tipped : 0;
		}
		return this;
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

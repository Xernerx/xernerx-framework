/** @format */

import { Client, ClientOptions, Collection, RESTGetAPISKUsResult } from 'discord.js';
import { ClusterClient, DjsDiscordClient, getInfo } from 'discord-hybrid-sharding';

import { ExtensionBuilder } from '@xernerx/extension-builder';
import { CommandHandler } from '../handler/CommandHandler.js';
import { ContextCommandBuilder } from '../build/ContextCommandBuilder.js';
import { ContextCommandHandlerOptions } from '../interfaces/ContextCommandHandlerOptions.js';
import { EventBuilder } from '../build/EventBuilder.js';
import { EventHandler } from '../handler/EventHandler.js';
import { ExtensionHandler } from '../handler/ExtensionHandler.js';
import { InhibitorBuilder } from '../build/InhibitorBuilder.js';
import { InhibitorHandler } from '../handler/InhibitorHandler.js';
import { MessageCommandBuilder } from '../build/MessageCommandBuilder.js';
import { MessageCommandHandlerOptions } from '../interfaces/MessageCommandHandlerOptions.js';
import { SlashCommandBuilder } from '../build/SlashCommandBuilder.js';
import { SlashCommandHandlerOptions } from '../interfaces/SlashCommandHandlerOptions.js';
import { UserEngagementData, XernerxClientOptions } from '../interfaces/XernerxClientOptions.js';
import { XernerxClientStats } from '../interfaces/XernerxClientStats.js';
import { XernerxError } from '../tools/XernerxError.js';
import { XernerxInfo } from '../tools/XernerxInfo.js';
import { XernerxInitial } from '../tools/XernerxInitial.js';
import { XernerxMonitisation } from '../model/XernerxMonitisation.js';
import { XernerxSuccess } from '../tools/XernerxSuccess.js';
import sharpyy from 'sharpyy';
import z from 'zod';

/**
 * Core Discord client for the Xernerx framework, extending `discord.js`'s `Client`
 * with built-in handlers for commands, events, inhibitors, extensions, sharding,
 * monetization, and user engagement caching.
 */
export class XernerxClient extends Client {
	// Config
	/** The Discord bot authentication token. */
	declare public readonly token: string;
	/** Whether the client is running in a sharded environment. */
	declare public readonly sharded: boolean;
	/** The current shard ID, or `null` if unsharded. */
	declare public shardId: number | null;
	/** Validated client configuration settings. */
	declare public readonly settings: XernerxClientOptions;
	/** Premium configuration options for owners, consumable entitlements, and startup synchronization. */
	declare public readonly premium: {
		/** Whether to automatically grant test entitlements to configured bot owners. */
		owners?: boolean;
		/** Whether to automatically consume consumable entitlements during synchronization. */
		consume?: boolean;
		/** Whether to synchronize owner entitlements when the client becomes ready. */
		synchronize?: boolean;
	};

	// Setup
	/** Cached monetization data including application SKUs. */
	declare public readonly monitisation: {
		/** List of application SKUs fetched from Discord. */
		skus: RESTGetAPISKUsResult;
	};
	/** Live statistics for the client and its shards. */
	declare public readonly stats: XernerxClientStats;
	/** The `discord-hybrid-sharding` cluster client instance when sharded, or `null`. */
	declare public readonly cluster: ClusterClient | null;
	/** Internal message and slash command response caches. */
	declare public readonly cache: {
		/** Maps trigger message IDs to bot response message IDs for edit/delete handling. */
		messages: Collection<string, string>;
		/** Cache collection for slash command interactions. */
		slash: Collection<string, string>;
	};
	/** Configuration options registered for message, slash, and context command handlers. */
	declare public readonly handler: {
		/** Message command handler configuration. */
		message: MessageCommandHandlerOptions;
		/** Slash command handler configuration. */
		slash: SlashCommandHandlerOptions;
		/** Context menu command handler configuration. */
		context: ContextCommandHandlerOptions;
	};

	// Collections
	/** Collections of registered message, slash, and context menu commands. */
	declare public readonly commands: {
		/** Registered message commands keyed by command ID. */
		message: Collection<string, MessageCommandBuilder>;
		/** Registered slash commands keyed by command ID. */
		slash: Collection<string, SlashCommandBuilder>;
		/** Registered context menu commands keyed by command ID. */
		context: Collection<string, ContextCommandBuilder>;
	};
	/** Collection of registered event builders keyed by event ID. */
	declare public readonly events: Collection<string, EventBuilder>;
	/** Collection of registered inhibitor builders keyed by inhibitor ID. */
	declare public readonly inhibitors: Collection<string, InhibitorBuilder>;
	/** Collection of registered framework extensions keyed by extension ID. */
	declare public readonly extensions: Collection<string, ExtensionBuilder>;
	/** In-memory TTL cache storing user engagement states (`voted`, `reviewed`, `tipped`). */
	declare public userEngagementCache: Map<string, UserEngagementData>;
	/** Optional `@xernerx/hooks` client attached to this bot instance. */
	declare public hooks?: any;

	// Handlers
	/** Core module handlers for events, commands, inhibitors, and extensions. */
	declare public readonly modules: {
		/** Handler responsible for loading and binding events. */
		eventHandler: EventHandler;
		/** Handler responsible for loading message, slash, and context commands. */
		commandHandler: CommandHandler;
		/** Handler responsible for loading command and interaction inhibitors. */
		inhibitorHandler: InhibitorHandler;
		/** Handler responsible for loading framework extensions. */
		extensionHandler: ExtensionHandler;
	};

	/**
	 * Creates a new `XernerxClient` instance.
	 *
	 * @param options - Discord.js `ClientOptions` combined with `XernerxClientOptions`.
	 */
	constructor(options: ClientOptions & XernerxClientOptions) {
		try {
			options.shards = getInfo().SHARD_LIST;
			options.shardCount = getInfo().TOTAL_SHARDS;
		} catch {
			new XernerxInitial('Client');
		}

		super(options);

		this.settings = z
			.object({
				token: z.string(),
				global: z.boolean().default(false),
				guildId: z.string().or(z.array(z.string()).max(5)).default([]),
				owners: z.string().or(z.array(z.string()).max(5)).default([]),
				premium: z
					.object({
						owners: z.boolean().default(false),
						consume: z.boolean().default(false),
						synchronize: z.boolean().default(false),
					})
					.optional(),
			})
			.parse(options);

		this.sharded = options.shardCount ? true : false;
		this.shardId = null;
		this.token = options.token as string;

		this.settings.guildId = typeof this.settings.guildId == 'string' ? [this.settings.guildId] : this.settings.guildId;
		this.settings.owners = typeof this.settings.owners == 'string' ? [this.settings.owners] : this.settings.owners;

		this.premium = this.settings.premium || {
			owners: false,
			consume: false,
			synchronize: false,
		};

		delete this.settings.premium;

		this.monitisation = { skus: [] };

		// Data

		this.stats = {
			onlineSince: Number(new Date()),
			guildCount: null,
			userCount: null,
			shardCount: null,
			voteCount: null,
			shard: null,
			shards: [],
		};

		this.cache = { messages: new Collection(), slash: new Collection() };

		this.handler = {
			message: { directory: null },
			slash: { directory: null },
			context: { directory: null },
		};

		// Collections

		this.commands = { message: new Collection(), slash: new Collection(), context: new Collection() };

		this.events = new Collection();

		this.inhibitors = new Collection();

		this.extensions = new Collection();

		this.userEngagementCache = new Map();

		// Modules

		this.modules = {
			eventHandler: new EventHandler(this),
			commandHandler: new CommandHandler(this),
			inhibitorHandler: new InhibitorHandler(this),
			extensionHandler: new ExtensionHandler(this),
		};

		// Process

		if (this.sharded) this.cluster = new ClusterClient(this as unknown as DjsDiscordClient);

		(process as any).xernerx = {
			id: this.cluster?.id,
			global: this.settings.global,
		};
	}

	/**
	 * Connects the client to Discord and initializes various client statistics and handlers.
	 *
	 * @returns A promise that resolves when the client successfully logs in, or rejects with an error message if the login fails.
	 */
	async connect() {
		this.on('clientReady', async (client) => {
			new XernerxInfo(`Signing in as ${sharpyy(client.user?.tag, 'txBlue')}...`);

			this.monitisation.skus = await new XernerxMonitisation(client).sku();

			/** When the client is sharded */
			if (this.sharded && this.cluster) {
				this.stats.shard = {
					shardId: this.cluster.id,
					onlineSince: Number(new Date()),
					guildCount: null,
					userCount: null,
				};

				setInterval(async () => {
					if (!this.cluster || !this.stats.shard) return;

					this.stats.guildCount = (await this.cluster.broadcastEval('this.guilds.cache.size')).reduce((a, b) => a + b, 0);
					this.stats.userCount = (await this.cluster.broadcastEval('this.guilds.cache.map((a) => a.memberCount).reduce((a, b) => a + b, 0)')).reduce((a, b) => a + b, 0);
					this.stats.shardCount = getInfo().TOTAL_SHARDS;
					this.stats.shard.guildCount = client.guilds.cache.size;
					this.stats.voteCount = 0;
					this.stats.shard.userCount = client.guilds.cache.map((a) => a.memberCount).reduce((a, b) => a + b, 0);
				}, 1000);

				await new Promise((resolve) => setTimeout(resolve, 2000));

				new XernerxSuccess(
					`Signed in as ${sharpyy(client.user?.tag, 'txBlue')}, watching ${sharpyy(String(this.stats.shard?.guildCount?.toLocaleString()), 'txCyan')} guilds and users: ${sharpyy(String(this.stats.shard?.userCount?.toLocaleString()), 'txCyan')}`
				);
			} else {
				/** When the client is standalone */
				setInterval(() => {
					this.stats.guildCount = client.guilds.cache.size;
					this.stats.userCount = client.guilds.cache.map((a) => a.memberCount).reduce((a, b) => a + b, 0);
					this.stats.voteCount = 0;
					this.stats.shardCount = 0;
				}, 1000);

				await new Promise((resolve) => setTimeout(resolve, 2000));

				new XernerxSuccess(
					`Signed in as ${sharpyy(client.user?.tag, 'txBlue')}, watching ${sharpyy(String(this.stats.guildCount?.toLocaleString()), 'txCyan')} guilds and users: ${sharpyy(String(this.stats.userCount?.toLocaleString()), 'txCyan')}`
				);
			}
		});

		return await this.login(this.token).catch((error) => new XernerxError(error.message, 1));
	}

	/**
	 * Resolves and caches a user's engagement state (`voted`, `reviewed`, `tipped`) for this bot.
	 * Uses `@xernerx/hooks` if loaded, otherwise checks the in-memory TTL cache before falling back to the Xernerx API.
	 *
	 * @param userId - The Discord user ID whose engagement data should be resolved.
	 * @param force - Whether to bypass the in-memory TTL cache and fetch fresh engagement data.
	 * @returns A promise that resolves to the user's engagement state.
	 */
	public async resolveUserEngagement(userId: string, force = false): Promise<UserEngagementData> {
		const botId = this.user?.id || '';

		if (this.hooks && typeof this.hooks.getUserEngagement === 'function') {
			return await this.hooks.getUserEngagement(userId, botId || this.hooks.botId, force);
		}

		const compositeKey = botId ? `${botId}:${userId}` : userId;
		const cached = this.userEngagementCache.get(compositeKey) || this.userEngagementCache.get(userId);
		const now = Date.now();
		const ttlMs = 15 * 60 * 1000;

		if (cached) {
			if (cached.voted && cached.nextVoteAt) {
				const expiry = Date.parse(cached.nextVoteAt);
				if (!Number.isNaN(expiry) && now >= expiry) {
					cached.voted = false;
				}
			}

			if (!force && now - cached.updatedAt < ttlMs) {
				return cached;
			}
		}

		if (!botId) {
			const fallback: UserEngagementData = cached ?? {
				userId,
				botId: '',
				voted: false,
				lastVotedAt: null,
				nextVoteAt: null,
				reviewed: false,
				rating: null,
				tipped: 0,
				updatedAt: now,
			};
			return fallback;
		}

		const apiUrl = (
			typeof process !== 'undefined' && process.env?.API_URL
				? process.env.API_URL
				: typeof process !== 'undefined' && process.env?.ENVIRONMENT?.toUpperCase() === 'CANARY'
					? 'https://api.canary.xernerx.com'
					: 'https://api.xernerx.com'
		).replace(/\/$/, '');

		try {
			const response = await fetch(`${apiUrl}/v1/bots/${encodeURIComponent(botId)}/users/${encodeURIComponent(userId)}`, {
				method: 'GET',
				signal: typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(3000) : undefined,
			});

			if (response.ok) {
				const body: any = await response.json().catch(() => null);
				if (body && typeof body === 'object') {
					const nextState: UserEngagementData = {
						userId,
						botId,
						voted: Boolean(body.voted),
						lastVotedAt: typeof body.lastVotedAt === 'string' ? body.lastVotedAt : null,
						nextVoteAt: typeof body.nextVoteAt === 'string' ? body.nextVoteAt : null,
						reviewed: Boolean(body.reviewed),
						rating: typeof body.rating === 'number' ? body.rating : null,
						tipped: typeof body.tipped === 'number' && Number.isFinite(body.tipped) ? body.tipped : 0,
						updatedAt: Date.now(),
					};
					this.userEngagementCache.set(compositeKey, nextState);
					this.userEngagementCache.set(userId, nextState);
					return nextState;
				}
			}
		} catch {}

		const fallbackState: UserEngagementData = cached
			? { ...cached, updatedAt: Date.now() }
			: {
					userId,
					botId,
					voted: false,
					lastVotedAt: null,
					nextVoteAt: null,
					reviewed: false,
					rating: null,
					tipped: 0,
					updatedAt: Date.now(),
				};

		this.userEngagementCache.set(compositeKey, fallbackState);
		this.userEngagementCache.set(userId, fallbackState);
		return fallbackState;
	}
}

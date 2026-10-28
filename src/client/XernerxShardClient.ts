/** @format */

import { Cluster, ClusterManager, ClusterManagerOptions } from 'discord-hybrid-sharding';

import { XernerxError } from '../tools/XernerxError.js';
import { XernerxInfo } from '../tools/XernerxInfo.js';
import { XernerxInitial } from '../tools/XernerxInitial.js';
import { XernerxShardClientOptions } from '../interfaces/XernerxShardClientOptions.js';
import { XernerxSuccess } from '../tools/XernerxSuccess.js';
import fs from 'fs';
import sharpyy from 'sharpyy';

/**
 * Cluster and shard manager for scaling a `XernerxClient` across multiple processes
 * using `discord-hybrid-sharding`.
 */
export class XernerxShardClient extends ClusterManager {
	/** Set of currently online and ready shard clusters. */
	declare public readonly onlineShards: Set<Cluster>;
	/** Aggregated statistics across all managed shards. */
	declare public readonly stats: {
		/** Timestamp (in milliseconds) when the shard manager started. */
		onlineSince: number | null;
		/** Total number of guilds across all shards. */
		guildCount: number | null;
		/** Total number of users across all shards. */
		userCount: number | null;
		/** Total number of shards managed by the cluster manager. */
		shardCount: number | null;
		/** Total number of votes recorded for the bot. */
		voteCount: number | null;
		/** Array of individual shard statistics. */
		shards: [] | null;
	};

	/**
	 * Creates a new `XernerxShardClient` instance and spawns all shard clusters.
	 *
	 * @param options - `discord-hybrid-sharding` cluster manager options combined with `XernerxShardClientOptions`.
	 */
	constructor(options: ClusterManagerOptions & XernerxShardClientOptions) {
		new XernerxInitial('ShardClient');

		try {
			new XernerxInfo(`Loading ShardClient from ${sharpyy(options.file, 'bgGray')}`);
			(fs.readFileSync(options.file), 'utf-8');
			new XernerxSuccess(`ShardClient loaded successfully`);
		} catch {
			new XernerxError(`File ${sharpyy(options.file, 'bgGray')} not found.`, 1);
		}

		super(options.file, options);

		this.onlineShards = new Set();

		this.stats = {
			onlineSince: Number(new Date()),
			guildCount: null,
			userCount: null,
			shardCount: null,
			voteCount: null,
			shards: [],
		};

		this.on('clusterCreate', (cluster) => {
			new XernerxInfo(`Launching ${`${sharpyy(`shard ${cluster.id}`, 'txMagenta')}`}...`);

			cluster.on('ready', async () => {
				this.onlineShards.add(cluster);

				await cluster.send({ type: 'xernerx' });

				if (this.onlineShards.size == (this.totalClusters || this.totalShards)) this.update();
			});

			cluster.on('disconnect', () => {
				this.onlineShards.delete(cluster);
			});

			cluster.on('death', (error) => {
				this.onlineShards.delete(cluster);
			});
		});

		this.spawn({ timeout: -1 });
	}

	/**
	 * Starts periodic aggregation of statistics across all online shard clusters.
	 *
	 * @returns A promise that resolves once the initial shard readiness summary has been logged.
	 */
	private async update() {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		setInterval(async () => {
			const stats = await this.fetchClientValues('stats');

			const shards = await this.fetchClientValues('stats.shard');

			this.stats.guildCount = stats[0].guildCount;
			this.stats.userCount = stats[0].userCount;
			this.stats.shardCount = stats[0].shardCount;
			this.stats.voteCount = stats[0].voteCount;
			this.stats.shards = shards;
		}, 1000);

		await new Promise((resolve) => setTimeout(resolve, 4000));

		new XernerxSuccess(
			`${sharpyy('All Shards are online', 'bold')}! Watching ${sharpyy(String(this.stats.guildCount?.toLocaleString()), 'txCyan')} guilds and ${sharpyy(String(this.stats.userCount?.toLocaleString()), 'txCyan')} users and ${sharpyy(String(this.stats.shardCount?.toLocaleString()), 'txCyan')} shards.`
		);
	}
}

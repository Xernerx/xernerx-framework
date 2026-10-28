/** @format */

// Client statistics
/**
 * Runtime statistics tracked by `XernerxClient` for the bot and its shards.
 */
export interface XernerxClientStats {
	/** Timestamp (in milliseconds) when the client came online, or `null`. */
	onlineSince: number | null;
	/** Total number of guilds cached across the client or cluster, or `null`. */
	guildCount: number | null;
	/** Total number of users across all cached guilds, or `null`. */
	userCount: number | null;
	/** Total number of shards when sharded, or `0` / `null` when standalone. */
	shardCount: number | null;
	/** Total number of votes recorded for the bot, or `null`. */
	voteCount: number | null;
	/** Statistics specific to the current shard cluster when sharded, or `null` when standalone. */
	shard: {
		/** The ID of the current shard cluster. */
		shardId: number | null;
		/** Timestamp (in milliseconds) when the current shard came online. */
		onlineSince: number | null;
		/** Number of guilds managed by the current shard. */
		guildCount: number | null;
		/** Number of users across guilds managed by the current shard. */
		userCount: number | null;
	} | null;
	/** Array of shard statistics collected across clusters. */
	shards: [];
}

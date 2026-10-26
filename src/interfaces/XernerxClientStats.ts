/** @format */

// Client statistics
export interface XernerxClientStats {
	onlineSince: number | null;
	guildCount: number | null;
	userCount: number | null;
	shardCount: number | null;
	voteCount: number | null;
	shard: {
		shardId: number | null;
		onlineSince: number | null;
		guildCount: number | null;
		userCount: number | null;
	} | null;
	shards: [];
}

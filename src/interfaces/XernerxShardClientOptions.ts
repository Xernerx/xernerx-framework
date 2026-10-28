/** @format */

// Shard client configuration options
/**
 * Configuration options for initializing a `XernerxShardClient` cluster manager.
 */
export interface XernerxShardClientOptions {
	/** Path to the entry file that instantiates `XernerxClient` for each spawned shard cluster. */
	file: string;
}

/** @format */

// Client configuration options
/**
 * Cached user engagement state (`voted`, `reviewed`, `tipped`) for a specific user and bot on Xernerx.
 */
export interface UserEngagementData {
	/** The Discord user ID. */
	userId: string;
	/** The Discord bot application ID. */
	botId: string;
	/** Whether the user currently has an active vote for the bot. */
	voted: boolean;
	/** ISO timestamp of when the user last voted, or `null` if never. */
	lastVotedAt: string | null;
	/** ISO timestamp of when the user's vote expires and they can vote again, or `null`. */
	nextVoteAt: string | null;
	/** Whether the user has left a review for the bot. */
	reviewed: boolean;
	/** Rating score left by the user, or `null` if no review exists. */
	rating: number | null;
	/** Total credits tipped by the user to the bot. */
	tipped: number;
	/** Unix timestamp (in milliseconds) when this cache entry was last updated. */
	updatedAt: number;
}

/**
 * Configuration options for initializing a `XernerxClient`.
 */
export interface XernerxClientOptions {
	/** The Discord bot authentication token. */
	token: string;
	/** Whether slash and context commands should be deployed globally (`true`) or locally to `guildId` (`false`). */
	global?: boolean;
	/** Development or local guild ID(s) (up to 5) where non-global commands are deployed. */
	guildId?: string | Array<string>;
	/** Discord user ID(s) of the bot owners (up to 5). */
	owners?: string | Array<string>;
	/** Discord monetization and entitlement management settings. */
	premium?: {
		/** Whether to automatically grant test entitlements to configured bot owners on startup. */
		owners?: boolean; // grant premium to users when starting bot
		/** Whether to automatically consume consumable entitlements during synchronization. */
		consume?: boolean; // consume on buy
		/** Whether to synchronize owner entitlements on startup. */
		synchronize?: boolean; // synchronize entitlements on startup
	};
}

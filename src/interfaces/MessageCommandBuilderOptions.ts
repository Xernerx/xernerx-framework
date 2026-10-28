/** @format */

import { ChannelType, InteractionContextType, Locale, PermissionFlags } from 'discord.js';

/**
 * Configuration options for building a prefix or mention-triggered message command with `MessageCommandBuilder`.
 */
export interface MessageCommandBuilderOptions {
	// Discord
	/** Primary trigger name of the message command. */
	name: string;
	/** Optional description of the message command. */
	description?: string;
	/** Optional alias or array of aliases that also trigger this command. */
	alias?: string | string[];
	/** Optional command-specific prefix or array of prefixes. */
	prefix?: string | string[];
	/** Argument separator character or string (defaults to `' '`). */
	separator?: string;
	/** Optional localized names and descriptions mapped by Discord locale. */
	locales?: Partial<Record<Locale, { name: string; description: string }>>;
	/** Allowed interaction context types. */
	contexts?: Array<keyof typeof InteractionContextType>;
	/** Whether this command is restricted to NSFW channels. */
	nsfw?: boolean;
	/** Optional argument definitions for the message command. */
	options?: Array<any>;

	// Xernerx
	/** Whether executing this command requires an active Discord premium entitlement. */
	premium?: boolean;
	/** Whether executing this command requires the user to have an active vote for the bot. */
	voted?: boolean;
	/** Whether executing this command requires the user to have left a review for the bot. */
	reviewed?: boolean;
	/** Whether executing this command requires the user to have tipped the bot (`true` or a minimum credit amount). */
	tipped?: boolean | number;
	/** Deployment scope settings for global or guild-restricted availability. */
	deploy?: {
		/** Whether the command is available globally. */
		global?: boolean;
		/** Specific guild ID(s) where the command is available. */
		guilds?: Array<string> | string;
	};
	/** Extended information or help text about the command. */
	info?: string;
	/** Example usage string for the command. */
	usage?: string;
	/** Category name for grouping the command in help menus. */
	category?: string;
	/** Cooldown duration for the command. */
	cooldown?: number;
	/** Required permissions for the bot client and the invoking user. */
	permissions?: {
		/** Permissions required by the bot client. */
		client?: Array<keyof PermissionFlags> | bigint | number | null;
		/** Permissions required by the invoking user. */
		user?: Array<keyof PermissionFlags> | bigint | number | null;
	};
	/** Strict whitelist rules restricting where and by whom the command can be executed. */
	strict?: {
		/** Whether only bot owners can execute this command. */
		owner?: boolean;
		/** Whitelisted user IDs allowed to execute this command. */
		users?: Array<string>;
		/** Whitelisted channel IDs where this command can be executed. */
		channels?: Array<string>;
		/** Whitelisted guild IDs where this command can be executed. */
		guilds?: Array<string>;
		/** Restricted channel type where this command can be executed. */
		types?: ChannelType;
	};
	/** Blacklist rules specifying users, channels, or guilds ignored by this command. */
	ignore?: {
		/** Whether bot owners are ignored by this command. */
		owner?: boolean;
		/** User IDs ignored by this command. */
		users?: Array<string>;
		/** Channel IDs ignored by this command. */
		channels?: Array<string>;
		/** Guild IDs ignored by this command. */
		guilds?: Array<string>;
		/** Channel type ignored by this command. */
		types?: ChannelType;
	};
}

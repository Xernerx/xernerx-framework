/** @format */

import { ApplicationIntegrationType, ChannelType, ContextMenuCommandType, InteractionContextType, Locale, PermissionFlags } from 'discord.js';

/**
 * Configuration options for building a user or message context menu command with `ContextCommandBuilder`.
 */
export interface ContextCommandBuilderOptions {
	// Discord
	/** The display name of the context menu command. */
	name: string;
	/** Optional localized names and descriptions mapped by Discord locale. */
	locales?: Partial<Record<Locale, { name: string; description: string }>>;
	/** Internal description of the context menu command. */
	description: string;
	/** Allowed interaction context types (e.g., `'Guild'`, `'BotDM'`, `'PrivateChannel'`). */
	contexts?: Array<keyof typeof InteractionContextType>;
	/** Allowed application integration types (e.g., `'GuildInstall'`, `'UserInstall'`). */
	integration?: Array<keyof typeof ApplicationIntegrationType>;
	/** The target type of the context menu command (`ApplicationCommandType.User` or `ApplicationCommandType.Message`). */
	type: ContextMenuCommandType;

	// Xernerx
	/** Whether executing this command requires an active Discord premium entitlement. */
	premium?: boolean;
	/** Whether executing this command requires the user to have an active vote for the bot. */
	voted?: boolean;
	/** Whether executing this command requires the user to have left a review for the bot. */
	reviewed?: boolean;
	/** Whether executing this command requires the user to have tipped the bot (`true` or a minimum credit amount). */
	tipped?: boolean | number;
	/** Whether to automatically defer the interaction reply before invoking `exec`. */
	defer?: boolean;
	/** Deployment configuration specifying global or guild-scoped registration. */
	deploy?: {
		/** Whether to deploy the command globally. */
		global?: boolean;
		/** Specific guild ID(s) to deploy the command to when not global. */
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

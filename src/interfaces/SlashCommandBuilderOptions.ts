/** @format */

import { ApplicationIntegrationType, ChannelType, InteractionContextType, Locale, PermissionFlags } from 'discord.js';

/**
 * Configuration options for building a chat input (slash) command with `SlashCommandBuilder`.
 */
export interface SlashCommandBuilderOptions {
	// Discord
	/** The name of the slash command (1-32 lowercase characters). */
	name: string;
	/** Optional localized names and descriptions mapped by Discord locale. */
	locales?: Partial<Record<Locale, { name: string; description: string }>>;
	/** The description of the slash command (1-100 characters). */
	description: string;
	/** Allowed interaction context types (e.g., `'Guild'`, `'BotDM'`, `'PrivateChannel'`). */
	contexts?: Array<keyof typeof InteractionContextType>;
	/** Allowed application integration types (e.g., `'GuildInstall'`, `'UserInstall'`). */
	integration?: Array<keyof typeof ApplicationIntegrationType>;
	/** Whether the slash command is age-restricted (NSFW). */
	nsfw?: boolean;
	/** Top-level options (arguments) for the slash command. */
	options?: Array<SlashCommandBuilderOption>;
	/** Subcommands belonging directly to this slash command. */
	subcommands?: Array<SlashCommandBuilderSubcommand>;
	/** Subcommand groups belonging to this slash command. */
	groups?: Array<SlashCommandBuilderGroup>;

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

/**
 * Definition for an individual option (argument) on a slash command or subcommand.
 */
export interface SlashCommandBuilderOption {
	/** The Discord option type. */
	type: 'attachment' | 'boolean' | 'channel' | 'integer' | 'mentionable' | 'number' | 'role' | 'string' | 'user';
	/** The option name (1-32 lowercase characters). */
	name: string;
	/** Optional localized names and descriptions mapped by Discord locale. */
	locales?: Partial<Record<Locale, { name: string; description: string }>>;
	/** The option description (1-100 characters). */
	description: string;
	/** Whether the user must provide a value for this option. */
	required?: boolean;
	/** Whether dynamic autocomplete is enabled for this option. */
	autocomplete?: boolean;
	// string only
	/** Maximum allowed string length (for `'string'` options). */
	maxLength?: number;
	/** Minimum allowed string length (for `'string'` options). */
	minLength?: number;
	/** Predefined choices presented to the user (for `'string'` options). */
	choices?: Array<{
		/** Display name of the choice. */
		name: string;
		/** Underlying string value of the choice. */
		value: string;
		/** Optional localized display names for the choice. */
		locales?: Partial<Record<Locale, string>>;
	}>;
}

/**
 * Definition for a subcommand within a slash command or subcommand group.
 */
export interface SlashCommandBuilderSubcommand {
	/** The subcommand name (1-32 lowercase characters). */
	name: string;
	/** The subcommand description (1-100 characters). */
	description: string;
	/** Optional array of options accepted by this subcommand. */
	options?: Array<SlashCommandBuilderOption>;
	/** Optional localized names and descriptions mapped by Discord locale. */
	locales?: Partial<Record<Locale, { name: string; description: string }>>;
}

/**
 * Definition for a subcommand group within a slash command.
 */
export interface SlashCommandBuilderGroup {
	/** The subcommand group name (1-32 lowercase characters). */
	name: string;
	/** The subcommand group description (1-100 characters). */
	description: string;
	/** Array of subcommands contained within this group. */
	subcommands: Array<SlashCommandBuilderSubcommand>;
	/** Optional localized names and descriptions mapped by Discord locale. */
	locales?: Partial<Record<Locale, { name: string; description: string }>>;
}

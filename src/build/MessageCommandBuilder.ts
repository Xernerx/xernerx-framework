/** @format */

import { ApplicationIntegrationType, ChannelType, PermissionFlags, Permissions } from 'discord.js';

import { BaseBuilder } from './BaseBuilder.js';
import { MessageCommandBuilderOptions } from '../interfaces/MessageCommandBuilderOptions.js';
import { XernerxWarn } from '../tools/XernerxWarn.js';
import { z } from 'zod';

/**
 * Builder class for defining prefix or mention-triggered Discord message commands with
 * built-in validation, aliases, permissions, and engagement/monetization requirements.
 */
export class MessageCommandBuilder extends BaseBuilder {
	// Discord
	/** Primary trigger name of the message command. */
	declare public readonly name: string;
	/** Optional description of the message command. */
	declare public readonly description?: string;
	/** Array of command aliases that also trigger this message command. */
	declare public readonly alias: Array<string>;
	/** Command-specific prefixes that can trigger this message command. */
	declare public readonly prefix: Array<string>;
	/** Argument separator character or string (defaults to `' '`). */
	declare public readonly separator: string;
	/** Whether this command requires an active Discord premium entitlement. */
	declare public readonly premium?: boolean;
	/** Whether this command requires the user to have an active vote for the bot. */
	declare public readonly voted?: boolean;
	/** Whether this command requires the user to have left a review for the bot. */
	declare public readonly reviewed?: boolean;
	/** Whether this command requires the user to have tipped the bot (or a minimum credit threshold). */
	declare public readonly tipped?: boolean | number;
	/** Deployment scope settings for global or guild-restricted availability. */
	declare public readonly deploy?: {
		/** Whether the command is available globally. */
		global?: boolean;
		/** Specific guild ID(s) where the command is available. */
		guilds?: Array<string> | string;
	};
	/** Extended information or help text about the command. */
	declare public readonly info?: string;
	/** Example usage string for the command. */
	declare public readonly usage?: string;
	/** Category name for grouping the command in help menus. */
	declare public readonly category?: string;
	/** Cooldown duration for the command. */
	declare public readonly cooldown?: number;
	/** Required permissions for the bot client and the invoking user. */
	declare public readonly permissions: {
		/** Permissions required by the bot client. */
		client: Permissions | number | bigint | null;
		/** Permissions required by the invoking user. */
		user: Permissions | number | bigint | null;
	};
	/** Strict whitelist rules restricting where and by whom the command can be executed. */
	declare public readonly strict?: {
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
	declare public readonly ignore?: {
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

	// Static
	/** Static discriminator identifying this builder as a Xernerx message command. */
	declare public readonly filetype: 'XernerxMessageCommand';

	/**
	 * Constructs an instance of XernerxMessageCommandBuilder.
	 *
	 * @param id - A unique identifier for the command.
	 * @param options - An object containing configuration options for the command.
	 * @param options.name - The name of the command.
	 * @param options.alias - An alias or an array of aliases for the command.
	 * @param options.prefix - A prefix or an array of prefixes for the command.
	 * @param options.premium - An array indicating premium features or settings.
	 */
	constructor(id: string, options: MessageCommandBuilderOptions) {
		super(id, options);

		options = z
			.object({
				name: z.string(),
				description: z.string().optional(),
				alias: z.union([z.string(), z.array(z.string())]).default([]),
				prefix: z.union([z.string(), z.array(z.string())]).default([]),
				separator: z.string().default(' '),
				locales: z.record(z.string(), z.object({ name: z.string(), description: z.string() })).optional(),
				integration: z.array(z.custom<keyof typeof ApplicationIntegrationType>()).default(['GuildInstall']),
				nsfw: z.boolean().default(false),
				options: z.any(),
				premium: z.boolean().default(false),
				voted: z.boolean().default(false),
				reviewed: z.boolean().default(false),
				tipped: z.union([z.boolean(), z.number().min(0)]).default(false),
				deploy: z.object({ global: z.boolean().default(true), guilds: z.string().or(z.array(z.string())).default([]) }).optional(),
				info: z.string().optional(),
				usage: z.string().optional(),
				category: z.string().optional(),
				cooldown: z.number().min(0).default(0),
				strict: z
					.object({
						owner: z.boolean().default(false),
						users: z.array(z.string()).default([]),
						channels: z.array(z.string()).default([]),
						guilds: z.array(z.string()).default([]),
						types: z.enum(ChannelType).optional(),
					})
					.optional(),
				ignore: z
					.object({
						owner: z.boolean().default(false),
						users: z.array(z.string()).default([]),
						channels: z.array(z.string()).default([]),
						guilds: z.array(z.string()).default([]),
						types: z.enum(ChannelType).optional(),
					})
					.optional(),
				permissions: z
					.object({
						client: z
							.union([z.array(z.custom<keyof PermissionFlags>()), z.number(), z.bigint()])
							.nullable()
							.default(null),
						user: z
							.union([z.array(z.custom<keyof PermissionFlags>()), z.number(), z.bigint()])
							.nullable()
							.default(null),
					})
					.default({ client: null, user: null }),
			})
			.parse(options);

		this.name = options.name;

		this.alias = typeof options.alias == 'string' ? [options.alias] : (options.alias as Array<string>);

		this.prefix = typeof options.prefix == 'string' ? [options.prefix] : (options.prefix as Array<string>);

		this.separator = options.separator || ' ';

		this.description = options.description;

		this.info = options.info;

		this.usage = options.usage;

		this.category = options.category;

		this.cooldown = options.cooldown;

		this.premium = options.premium || false;

		this.voted = options.voted || false;

		this.reviewed = options.reviewed || false;

		this.tipped = options.tipped || false;

		this.deploy = {
			global: options.deploy?.global ?? true,
			guilds: typeof options.deploy?.guilds == 'string' ? [options.deploy.guilds] : options.deploy?.guilds || [],
		};

		this.permissions = options.permissions as typeof this.permissions;

		this.strict = options.strict;

		this.ignore = options.ignore;

		this.filetype = 'XernerxMessageCommand';
	}

	/**
	 * Evaluates custom pre-execution conditions for the message command.
	 *
	 * @param args - Arguments passed to the condition evaluator.
	 * @returns A promise that resolves to a boolean or void indicating whether execution should be halted.
	 */
	public async conditions(args: any): Promise<void | any> {}

	/**
	 * Executes the command logic. This function is intended to be overridden by subclasses.
	 * If not overridden, it will log a warning indicating that the command will not respond.
	 *
	 * @param args - A variable number of arguments that can be passed to the command execution.
	 * @returns A promise that resolves to any value, depending on the implementation.
	 */
	public async exec(...args: any[]): Promise<any> {
		new XernerxWarn(`${this.id} has no exec function, command will not respond.`);
	}
}

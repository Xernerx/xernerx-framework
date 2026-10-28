/** @format */

import {
	ApplicationIntegrationType,
	ChannelType,
	ContextMenuCommandBuilder,
	ContextMenuCommandType,
	InteractionContextType,
	Locale,
	PermissionFlags,
	PermissionFlagsBits,
	Permissions,
	RestOrArray,
} from 'discord.js';

import { BaseBuilder } from './BaseBuilder.js';
import { ContextCommandBuilderOptions } from '../interfaces/ContextCommandBuilderOptions.js';
import { ContextCommandOptions } from '../interfaces/ContextCommandOptions.js';
import { XernerxWarn } from '../tools/XernerxWarn.js';
import { z } from 'zod';

/**
 * Builder class for defining Discord user and message context menu commands with
 * built-in validation, permissions, localization, and engagement/monetization requirements.
 */
export class ContextCommandBuilder extends BaseBuilder {
	// Discord
	/** The display name of the context menu command. */
	declare public readonly name: string;
	/** Internal description of the context menu command. */
	declare public readonly description: string;
	/** Allowed interaction contexts for the context menu command. */
	declare public readonly integration: RestOrArray<InteractionContextType>;
	/** The underlying `discord.js` `ContextMenuCommandBuilder` instance used for deployment. */
	declare public readonly data: ContextMenuCommandBuilder;
	/** The context menu command target type (`ApplicationCommandType.User` or `ApplicationCommandType.Message`). */
	declare public readonly type: ContextMenuCommandType;

	// Xernerx
	/** Whether this command requires an active Discord premium entitlement. */
	declare public readonly premium?: boolean;
	/** Whether this command requires the user to have an active vote for the bot. */
	declare public readonly voted?: boolean;
	/** Whether this command requires the user to have left a review for the bot. */
	declare public readonly reviewed?: boolean;
	/** Whether this command requires the user to have tipped the bot (or a minimum credit threshold). */
	declare public readonly tipped?: boolean | number;
	/** Whether the interaction reply should be automatically deferred before execution. */
	declare public readonly defer?: boolean;
	/** Deployment configuration specifying global or guild-scoped registration. */
	declare public readonly deploy?: {
		/** Whether to deploy the command globally. */
		global?: boolean;
		/** Specific guild ID(s) to deploy the command to when not global. */
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
	/** Static discriminator identifying this builder as a Xernerx context menu command. */
	declare public readonly filetype: 'XernerxContextCommand';

	/**
	 * Constructs a new `ContextCommandBuilder` instance.
	 *
	 * @param id - A unique identifier for the context menu command.
	 * @param options - Configuration options defining the context menu command and its requirements.
	 */
	constructor(id: string, options: ContextCommandBuilderOptions) {
		super(id, options);

		options = z
			.object({
				// Discord
				name: z.string(),
				locales: z.record(z.string(), z.object({ name: z.string() })).optional(),
				description: z.string(),
				contexts: z.array(z.custom<keyof typeof InteractionContextType>()).default(['Guild']),
				integration: z.array(z.custom<keyof typeof ApplicationIntegrationType>()).default(['GuildInstall']),
				type: z.custom<ContextMenuCommandType>(),

				// Xernerx
				premium: z.boolean().default(false),
				voted: z.boolean().default(false),
				reviewed: z.boolean().default(false),
				tipped: z.union([z.boolean(), z.number().min(0)]).default(false),
				defer: z.boolean().default(false),
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

		this.description = options.description;

		this.info = options.info;

		this.usage = options.usage;

		this.category = options.category;

		this.cooldown = options.cooldown;

		this.premium = options.premium || false;

		this.voted = options.voted || false;

		this.reviewed = options.reviewed || false;

		this.tipped = options.tipped || false;

		this.defer = options.defer;

		this.deploy = {
			global: options.deploy?.global ?? true,
			guilds: typeof options.deploy?.guilds == 'string' ? [options.deploy.guilds] : options.deploy?.guilds || [],
		};

		this.filetype = 'XernerxContextCommand';

		this.permissions = options.permissions as typeof this.permissions;

		this.strict = options.strict;

		this.ignore = options.ignore;

		this.data = new ContextMenuCommandBuilder();

		this.data.setName(this.name);

		this.data.setType(options.type);

		this.data.setContexts(...(options.contexts?.map((context) => InteractionContextType[context as keyof typeof InteractionContextType]) || [InteractionContextType.Guild]));

		this.data.setIntegrationTypes(
			...(options.integration?.map((integration) => ApplicationIntegrationType[integration as keyof typeof ApplicationIntegrationType]) || [ApplicationIntegrationType.GuildInstall])
		);

		if (Array.isArray(options.permissions?.user))
			this.data.setDefaultMemberPermissions(options.permissions?.user?.map((permission) => PermissionFlagsBits[permission as keyof PermissionFlags]).reduce((a, b) => (a += b)));
		else this.data.setDefaultMemberPermissions(options.permissions?.user || null);

		for (const locale of Object.entries(options.locales || [])) {
			this.data.setNameLocalization(locale[0] as Locale, locale[1].name);
		}

		this.client = this.client;
	}
	/**
	 * Evaluates conditions for executing a slash command.
	 *
	 * @param args - The arguments for the conditions function, which include the context and options for the command.
	 * @returns A promise that resolves to either void or any value, depending on the implementation.
	 */
	public async conditions(args: ContextCommandOptions<'message' | 'user'>): Promise<void | any> {}

	/**
	 * Executes the slash command.
	 *
	 * @param args - The arguments for the exec function, which include the context and options for the command.
	 * @returns A promise that resolves to either void or any value, depending on the implementation.
	 */
	public async exec(args: ContextCommandOptions<'message' | 'user'>): Promise<void | any> {
		new XernerxWarn(`${this.id} has no exec function, command will not respond.`);
	}
}

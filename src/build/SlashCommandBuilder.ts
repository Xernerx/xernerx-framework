/** @format */

import {
	ApplicationIntegrationType,
	ChannelType,
	SlashCommandBuilder as DiscordSlashCommandBuilder,
	InteractionContextType,
	Locale,
	PermissionFlags,
	PermissionFlagsBits,
	Permissions,
	RestOrArray,
	SlashCommandBooleanOption,
	SlashCommandChannelOption,
	SlashCommandIntegerOption,
	SlashCommandMentionableOption,
	SlashCommandNumberOption,
	SlashCommandRoleOption,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
	SlashCommandUserOption,
} from 'discord.js';
import { SlashCommandAutocomplete, SlashCommandError, SlashCommandOptions } from '../interfaces/SlashCommandOptions.js';
import { SlashCommandBuilderGroup, SlashCommandBuilderOption, SlashCommandBuilderOptions, SlashCommandBuilderSubcommand } from '../interfaces/SlashCommandBuilderOptions.js';

import { BaseBuilder } from './BaseBuilder.js';
import { XernerxWarn } from '../tools/XernerxWarn.js';
import { z } from 'zod';

/**
 * Builder class for defining Discord chat input (slash) commands with built-in validation,
 * permissions, localization, subcommands, and engagement/monetization requirements.
 */
export class SlashCommandBuilder extends BaseBuilder {
	// Discord
	/** The name of the slash command. */
	declare public readonly name: string;
	/** The description of the slash command. */
	declare public readonly description: string;
	/** Allowed interaction contexts for the slash command. */
	declare public readonly integration: RestOrArray<InteractionContextType>;
	/** The underlying `discord.js` `SlashCommandBuilder` instance used for deployment. */
	declare public readonly data: DiscordSlashCommandBuilder;
	/** Array of top-level options configured for this slash command. */
	declare public readonly options: Array<SlashCommandBuilderOption>;
	/** Array of subcommands configured for this slash command. */
	declare public readonly subcommands: Array<SlashCommandBuilderSubcommand>;
	/** Array of subcommand groups configured for this slash command. */
	declare public readonly groups: Array<SlashCommandBuilderGroup>;

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
	/** Cooldown duration in milliseconds (or seconds depending on consumer) for the command. */
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
	/** Static discriminator identifying this builder as a Xernerx slash command. */
	declare public readonly filetype: 'XernerxSlashCommand';

	/**
	 * Constructs a new `SlashCommandBuilder` instance.
	 *
	 * @param id - A unique identifier for the slash command.
	 * @param options - Configuration options defining the slash command structure and requirements.
	 */
	constructor(id: string, options: SlashCommandBuilderOptions) {
		super(id, options);

		options = z
			.object({
				// Discord
				name: z.string(),
				locales: z.record(z.string(), z.object({ name: z.string(), description: z.string() })).optional(),
				description: z.string(),
				contexts: z.array(z.custom<keyof typeof InteractionContextType>()).default(['Guild']),
				integration: z.array(z.custom<keyof typeof ApplicationIntegrationType>()).default(['GuildInstall']),
				nsfw: z.boolean().default(false),
				options: z.any(),
				subcommands: z.any(),
				groups: z.any(),

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

		this.filetype = 'XernerxSlashCommand';

		this.permissions = options.permissions as typeof this.permissions;

		this.strict = options.strict;

		this.ignore = options.ignore;

		this.data = new DiscordSlashCommandBuilder();

		this.data.setName(this.name);

		this.data.setDescription(this.description);

		this.data.setContexts(...(options.contexts?.map((context) => InteractionContextType[context as keyof typeof InteractionContextType]) || [InteractionContextType.Guild]));

		this.data.setIntegrationTypes(
			...(options.integration?.map((integration) => ApplicationIntegrationType[integration as keyof typeof ApplicationIntegrationType]) || [ApplicationIntegrationType.GuildInstall])
		);

		if (Array.isArray(options.permissions?.user))
			this.data.setDefaultMemberPermissions(options.permissions?.user?.map((permission) => PermissionFlagsBits[permission as keyof PermissionFlags]).reduce((a, b) => (a += b)));
		else this.data.setDefaultMemberPermissions(options.permissions?.user || null);

		this.data.setNSFW(options.nsfw || false);

		for (const locale of Object.entries(options.locales || [])) {
			this.data.setNameLocalization(locale[0] as Locale, locale[1].name);
			this.data.setDescriptionLocalization(locale[0] as Locale, locale[1].description);
		}

		if (options.options && options?.options?.length > 0) {
			this.addArguments(this.data, options.options);

			this.options = options.options;
		}

		if (options.subcommands && options?.subcommands?.length > 0) {
			this.addSubcommands(this.data, options.subcommands);

			this.subcommands = options.subcommands;
		}

		if (options.groups && options?.groups?.length > 0) {
			this.addSubcommandGroups(options.groups);

			this.groups = options.groups;
		}

		this.client = this.client;
	}

	/**
	 * Handles the autocomplete functionality for a slash command.
	 *
	 * @param args - The arguments for the autocomplete function, which include the context and options for the command.
	 * @returns A promise that resolves to either void or any value, depending on the implementation.
	 */
	public async autocomplete(args: SlashCommandAutocomplete): Promise<void | any> {}

	/**
	 * Evaluates conditions for executing a slash command.
	 *
	 * @param args - The arguments for the conditions function, which include the context and options for the command.
	 * @returns A promise that resolves to either void or any value, depending on the implementation.
	 */
	public async conditions(args: SlashCommandOptions): Promise<void | any> {}

	/**
	 * Executes the slash command.
	 *
	 * @param args - The arguments for the exec function, which include the context and options for the command.
	 * @returns A promise that resolves to either void or any value, depending on the implementation.
	 */
	public async exec(args: SlashCommandOptions): Promise<void | any> {
		new XernerxWarn(`${this.id} has no exec function, command will not respond.`);
	}

	/**
	 * Handles errors thrown during the execution of the slash command.
	 *
	 * @param args - The error context including the interaction, parsed options, command instance, and thrown error.
	 * @returns A promise that resolves when error handling is complete.
	 */
	public async error(args: SlashCommandError): Promise<void | any> {}

	/**
	 * Adds command arguments (options) to a Discord slash command or subcommand builder.
	 *
	 * @param command - The target Discord slash command or subcommand builder.
	 * @param args - Array of option definitions to attach to the command.
	 */
	private addArguments(command: DiscordSlashCommandBuilder | SlashCommandSubcommandBuilder, args: Array<SlashCommandBuilderOption>) {
		for (const argument of args) {
			let slashCommandArgumentType: string = `${argument.type.charAt(0).toUpperCase()}${argument.type.slice(1).toLowerCase()}`;

			(command[`add${slashCommandArgumentType as UpperCasedSlashCommandArgumentOptions}Option`] as Function)((option: SlashCommandOption) => {
				option
					.setName(argument.name)
					.setDescription(argument.description)
					.setRequired(argument.required || false);

				for (const locale of Object.entries(argument.locales || [])) {
					option.setNameLocalization(locale[0] as Locale, locale[1].name);
					option.setDescriptionLocalization(locale[0] as Locale, locale[1].description);
				}

				if (slashCommandArgumentType === 'String') {
					if (argument.choices) {
						for (const choice of argument.choices) {
							const locales = choice?.locales;

							(option as SlashCommandStringOption).addChoices({ ...choice, name_localizations: locales });
						}
					}

					if (argument.maxLength) (option as SlashCommandStringOption).setMaxLength(argument.maxLength);
					if (argument.minLength) (option as SlashCommandStringOption).setMinLength(argument.minLength);

					(option as SlashCommandStringOption).setAutocomplete(argument.autocomplete || false);
				}

				return option;
			});
		}
	}

	/**
	 * Adds subcommands to a Discord slash command or subcommand group builder.
	 *
	 * @param method - The target Discord slash command or subcommand group builder.
	 * @param subcommands - Array of subcommand definitions to attach.
	 */
	private addSubcommands(method: DiscordSlashCommandBuilder | SlashCommandSubcommandGroupBuilder, subcommands: Array<SlashCommandBuilderSubcommand>) {
		for (const subcommand of subcommands) {
			let sub = new SlashCommandSubcommandBuilder().setName(subcommand.name).setDescription(subcommand.description);

			for (const locale of Object.entries(subcommand.locales || [])) {
				sub.setNameLocalization(locale[0] as Locale, locale[1].name);
				sub.setDescriptionLocalization(locale[0] as Locale, locale[1].description);
			}

			if (subcommand.options && subcommand?.options?.length > 0) this.addArguments(sub, subcommand.options);

			method.addSubcommand(sub);
		}
	}

	/**
	 * Adds subcommand groups to the slash command builder.
	 *
	 * @param groups - An array of subcommand groups to be added. Each group contains a name, description, locales, and subcommands.
	 */
	private addSubcommandGroups(groups: Array<SlashCommandBuilderGroup>) {
		for (const group of groups) {
			let subcommandGroup = new SlashCommandSubcommandGroupBuilder().setName(group.name).setDescription(group.description);

			for (const locale of Object.entries(group.locales || [])) {
				subcommandGroup.setNameLocalization(locale[0] as Locale, locale[1].name);
				subcommandGroup.setDescriptionLocalization(locale[0] as Locale, locale[1].description);
			}

			if (group.subcommands?.length > 0) this.addSubcommands(subcommandGroup, group.subcommands);

			this.data.addSubcommandGroup(subcommandGroup);
		}
	}
}

/** PascalCase slash command option type names used to dynamically invoke `add<Type>Option` on `discord.js` builders. */
type UpperCasedSlashCommandArgumentOptions = 'Attachment' | 'Boolean' | 'Channel' | 'Integer' | 'Mentionable' | 'Number' | 'Role' | 'String' | 'User';
/** Union of all supported `discord.js` slash command option builders. */
type SlashCommandOption = SlashCommandOptionChoices | SlashCommandBooleanOption | SlashCommandUserOption | SlashCommandChannelOption | SlashCommandRoleOption | SlashCommandMentionableOption;
/** Union of `discord.js` slash command option builders that support choices. */
type SlashCommandOptionChoices = SlashCommandStringOption | SlashCommandNumberOption | SlashCommandIntegerOption;

/** @format */

import { Attachment, AutocompleteFocusedOption, AutocompleteInteraction, Channel, ChatInputCommandInteraction, Role, User } from 'discord.js';

import { SlashCommandBuilder } from '../build/SlashCommandBuilder.js';

/**
 * Resolved slash command option value extracted from a `ChatInputCommandInteraction`,
 * discriminated by option `type`.
 */
export type SlashCommandOption = {
	/** The option name. */
	name: string;
	/** The raw option value. */
	value: string;
} & (
	| {
			/** String option type discriminator. */
			type: 'string';
	  }
	| {
			/** Number option type discriminator. */
			type: 'number';
			/** Resolved numeric value. */
			value: number;
	  }
	| {
			/** Boolean option type discriminator. */
			type: 'boolean';
			/** Resolved boolean value. */
			value: boolean;
	  }
	| {
			/** User option type discriminator. */
			type: 'user';
			/** Resolved Discord `User` entity. */
			user: User;
	  }
	| {
			/** Channel option type discriminator. */
			type: 'channel';
			/** Resolved Discord `Channel` entity. */
			channel: Channel;
	  }
	| {
			/** Role option type discriminator. */
			type: 'role';
			/** Resolved Discord `Role` entity. */
			role: Role;
	  }
	| {
			/** Mentionable option type discriminator. */
			type: 'mentionable';
			/** Resolved Discord `Role` if a role was mentioned. */
			role?: Role;
			/** Resolved Discord `User` if a user was mentioned. */
			user?: User;
	  }
	| {
			/** Integer option type discriminator. */
			type: 'integer';
			/** Resolved integer value. */
			value: number;
	  }
	| {
			/** Attachment option type discriminator. */
			type: 'attachment';
			/** Resolved Discord `Attachment` entity. */
			attachment: Attachment;
	  }
);

/**
 * Execution context passed to `SlashCommandBuilder.exec` and `SlashCommandBuilder.conditions`.
 */
export interface SlashCommandOptions {
	/** The Discord chat input command interaction. */
	interaction: ChatInputCommandInteraction;
	/** Record of resolved slash command options keyed by option name. */
	options: Record<string, SlashCommandOption>;
	/** The invoked subcommand name, or `null` if no subcommand was used. */
	subcommand: string | null;
	/** The invoked subcommand group name, or `null` if no subcommand group was used. */
	group: string | null;
	/** The `SlashCommandBuilder` instance being executed. */
	command: SlashCommandBuilder;
}

/**
 * Error context passed to `SlashCommandBuilder.error` when an exception occurs during command execution.
 */
export interface SlashCommandError extends SlashCommandOptions {
	/** The error thrown during command execution. */
	error: Error;
}

/**
 * Context passed to `SlashCommandBuilder.autocomplete` when handling autocomplete interactions.
 */
export interface SlashCommandAutocomplete {
	/** The Discord autocomplete interaction. */
	interaction: AutocompleteInteraction;
	/** The currently focused autocomplete option. */
	focused: AutocompleteFocusedOption;
	/** The interaction option resolver. */
	options: any;
}

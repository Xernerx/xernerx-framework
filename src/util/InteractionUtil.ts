/** @format */

import {
	BitFieldResolvable,
	Client,
	Collection,
	Interaction,
	InteractionEditReplyOptions,
	InteractionReplyOptions,
	MessageCreateOptions,
	MessageFlags,
	MessagePayload,
	RepliableInteraction,
	TextChannel,
} from 'discord.js';

import { BaseUtil } from './BaseUtil.js';
import { XernerxClient } from '../client/XernerxClient.js';
import { XernerxError } from '../tools/XernerxError.js';

/**
 * Utility class attached to `interaction.util` providing streamlined `send`, `reply`, and `webhook` methods
 * with automatic deferral/reply detection and Components V2 flag support.
 */
export class InteractionUtil extends BaseUtil {
	/** The repliable Discord interaction bound to this utility instance. */
	declare public readonly interaction: RepliableInteraction;
	/** Cache collection storing slash command response mappings. */
	declare public readonly cache: Collection<string, string>;
	/** Parsed string arguments associated with the interaction, if any. */
	declare public args: string[];

	/**
	 * Constructs a new `InteractionUtil` instance.
	 *
	 * @param client - The authenticated `XernerxClient` instance.
	 * @param interaction - The incoming Discord interaction.
	 */
	constructor(client: XernerxClient & Client<true>, interaction: Interaction) {
		super(client, interaction);

		this.interaction = interaction as RepliableInteraction;

		this.cache = this.client.cache.slash;
	}

	/**
	 * Sends a message to the channel associated with the interaction.
	 *
	 * @param options - The content or options for the message to be sent. It can be a string, MessagePayload, or MessageCreateOptions.
	 * @returns A promise that resolves to the sent message.
	 * @throws {XernerxError} Throws an error if the options parameter is not provided.
	 */
	public async send(options: (string | MessagePayload | MessageCreateOptions) & { display?: boolean }) {
		const flags = [];

		if (!options) throw new XernerxError(`Can't send a message without options.`);

		if (options.display) flags.push(MessageFlags.IsComponentsV2);

		if (typeof options !== 'string') {
			delete options.display;

			(options as InteractionEditReplyOptions).flags = flags as BitFieldResolvable<'SuppressEmbeds' | 'IsComponentsV2', MessageFlags.SuppressEmbeds | MessageFlags.IsComponentsV2> | undefined;
		}

		return await (this.interaction.channel as TextChannel).send(options);
	}

	/**
	 * Replies to the interaction with the provided options.
	 *
	 * @param options - The content or options for the reply. It can be a string, MessagePayload, or InteractionEditReplyOptions.
	 * @returns A promise that resolves to the sent message or the edited reply.
	 * @throws {XernerxError} Throws an error if the options parameter is not provided.
	 */
	public async reply(options: (string | MessagePayload | InteractionEditReplyOptions) & { ephemeral?: boolean; display?: boolean }) {
		const flags = [];

		if (!options) throw new XernerxError(`Can't send a message without options.`);

		if (options.ephemeral) flags.push(MessageFlags.Ephemeral);
		if (options.display) flags.push(MessageFlags.IsComponentsV2);

		if (typeof options !== 'string') {
			delete options.ephemeral;
			delete options.display;

			(options as InteractionEditReplyOptions).flags = flags as BitFieldResolvable<'SuppressEmbeds' | 'IsComponentsV2', MessageFlags.SuppressEmbeds | MessageFlags.IsComponentsV2> | undefined;
		}

		return await (this.interaction.replied || this.interaction.deferred ? this.interaction.editReply(options) : this.interaction.reply(options as InteractionReplyOptions));
	}
}

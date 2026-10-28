/** @format */

import { Client, Interaction, Message, MessagePayload, Webhook, WebhookMessageCreateOptions } from 'discord.js';

import { XernerxClient } from '../client/XernerxClient.js';

/**
 * Base utility class attached to interactions and messages, providing shared helpers such as webhook messaging.
 */
export class BaseUtil {
	/** The authenticated `XernerxClient` instance. */
	declare public readonly client: XernerxClient & Client<true>;
	/** Parsed command metadata extracted from a message (command name, alias, mention status, and prefix). */
	declare public readonly parsed: {
		/** Resolved command name, or `null` if none matched. */
		command: string | null;
		/** Resolved command alias or name, or `null` if none matched. */
		alias: string | null;
		/** Whether the message mentioned the bot user. */
		mention: boolean | null;
		/** Resolved command prefix used to trigger the command, or `null`. */
		prefix: string | null;
	};
	/** The underlying Discord `Interaction` or `Message` instance. */
	declare public interaction: Interaction | Message;

	/**
	 * Constructs a new `BaseUtil` instance.
	 *
	 * @param client - The authenticated `XernerxClient` instance.
	 * @param interaction - The Discord `Interaction` or `Message` being handled.
	 */
	constructor(client: XernerxClient & Client<true>, interaction: Interaction | Message) {
		this.client = client;

		this.parsed = { command: null, alias: null, mention: null, prefix: null };

		this.interaction = interaction;
	}

	/**
	 * Sends a message using a webhook in the current interaction's channel.
	 *
	 * @param options - The message content or options to send via the webhook. This can be a string, MessagePayload, or WebhookMessageCreateOptions.
	 * @returns A promise that resolves to the message sent by the webhook.
	 */
	public async webhook(options: string | MessagePayload | WebhookMessageCreateOptions) {
		if (!this.interaction.channel) return;

		// @ts-expect-error
		const webhooks = await this.interaction.channel.fetchWebhooks();
		let webhook = (await webhooks.find((wh: Webhook) => wh.token)) as Webhook;

		if (!webhook)
			// @ts-expect-error
			webhook = this.interaction.channel.createWebhook({
				name: this.client.user.username,
				avatar: this.client.user.displayAvatarURL(),
			});

		return await webhook.send(options);
	}
}

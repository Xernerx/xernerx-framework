/** @format */

import { Client, Collection, Message, MessageCreateOptions, MessageEditOptions, MessagePayload, MessageReplyOptions, TextChannel } from 'discord.js';

import { BaseUtil } from './BaseUtil.js';
import { XernerxClient } from '../client/XernerxClient.js';

export class MessageUtil extends BaseUtil {
	declare public readonly message: Message;
	declare public readonly cache: Collection<string, string>;
	declare public args: string[];

	constructor(client: XernerxClient & Client<true>, message: Message) {
		super(client, message);

		this.message = message;

		this.cache = this.client.cache.messages;

		this.args = [];

		this.parse();
	}

	/**
	 * Parses the message content to extract command, alias, prefix, and arguments.
	 * It also checks if the message mentions the bot.
	 */
	private parse() {
		if (this.message.content.trim().startsWith(`<@${this.client.user.id}>`)) this.message.content = this.message.content.replace(`<@${this.client.user.id}>`, '').trimStart();

		const [command, ...args] = this.message.content.split(this.client.handler.message.seperator || ' ');

		this.client.commands.message.map(({ name, prefix, alias }) => {
			if (command.toLowerCase().endsWith(name.toLowerCase())) {
				this.parsed.command = name;

				this.parsed.alias = name;
			}

			alias.map((a) => (command.toLowerCase().endsWith(a.toLowerCase()) ? (this.parsed.alias = a) : null));

			prefix.map((p) => (command.toLowerCase().startsWith(p.toLowerCase()) ? (this.parsed.prefix = p) : null));
		});

		(this.client.handler.message.prefix as string[])?.map((p) => (command.toLowerCase().startsWith(p.toLowerCase()) ? (this.parsed.prefix = p) : null));

		this.parsed.mention = this.message.mentions.has(this.client.user.id);

		this.args = args;
	}

	/**
	 * Sends a message to the channel or edits an existing message if applicable.
	 *
	 * @param options - The content or options for the message to be sent or edited.
	 *                  It can be a string, MessagePayload, MessageCreateOptions, or MessageEditOptions.
	 * @returns The sent or edited message, or null if the message ID is not found in the cache.
	 */
	async send(options: string | MessagePayload | MessageCreateOptions | MessageEditOptions) {
		if (this.cache.has(this.message.id) && this.client.handler.message.handleEdits) {
			const id = this.cache.get(this.message.id);

			if (!id) return null;

			const msg = await this.message.channel.messages.fetch(id);

			msg.edit(options as string);
			return msg;
		}

		const msg = await (this.message.channel as TextChannel).send(options as string);

		this.cache.set(this.message.id, msg.id);

		return msg;
	}

	/**
	 * Replies to the current message or edits an existing reply if applicable.
	 *
	 * @param options - The content or options for the reply message.
	 *                  It can be a string, MessagePayload, or MessageReplyOptions.
	 * @returns The sent or edited message, or null if the message ID is not found in the cache.
	 */
	async reply(options: string | MessagePayload | MessageReplyOptions) {
		if (this.cache.has(this.message.id) && this.client.handler.message.handleEdits) {
			const id = this.cache.get(this.message.id);

			if (!id) return null;

			const msg = await this.message.channel.messages.fetch(id);

			msg.edit(options as string);

			return msg;
		}

		const msg = await this.message.reply(options);

		this.cache.set(this.message.id, msg.id);

		return msg;
	}
}

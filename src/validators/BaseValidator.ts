/** @format */

import { Interaction, Message } from 'discord.js';

import { ContextCommandBuilder } from '../build/ContextCommandBuilder.js';
import { MessageCommandBuilder } from '../build/MessageCommandBuilder.js';
import { SlashCommandBuilder } from '../build/SlashCommandBuilder.js';
import { XernerxClient } from '../client/XernerxClient.js';

/**
 * Base validator class that evaluates command requirements (global/guild availability,
 * Discord premium entitlements, votes, reviews, and tips) before command execution
 * and emits `commandBlock` events when a requirement is not met.
 */
export class BaseValidator {
	/** The `XernerxClient` instance. */
	declare public readonly client: XernerxClient;
	/** The Discord `Interaction` or `Message` triggering the command. */
	declare public readonly interaction: Interaction | Message;
	/** The command builder instance being validated. */
	declare public readonly command: SlashCommandBuilder | MessageCommandBuilder | ContextCommandBuilder;
	/** Whether all evaluated validation checks have been satisfied so far. */
	declare public satisified: boolean;

	/**
	 * Constructs a new `BaseValidator` instance.
	 *
	 * @param interaction - The Discord `Interaction` or `Message` triggering the command.
	 * @param command - The command builder instance to validate against.
	 */
	constructor(interaction: Interaction | Message, command: SlashCommandBuilder | MessageCommandBuilder | ContextCommandBuilder) {
		this.client = interaction.client;

		this.interaction = interaction;

		this.command = command;

		this.satisified = true;
	}

	/**
	 * Checks if the command requires a premium subscription and validates the user's premium status.
	 * If the user does not have a premium subscription, it emits an error and sets the validation status to false.
	 *
	 * @returns A promise that resolves when the premium check is complete.
	 */
	public async premium() {
		if (!this.command.premium) return;

		const premium = await this.interaction.user.premium('');

		if (!premium) {
			this.emit({ type: 'premiumCommand', message: 'This command requires a premium subscription.', data: [] });

			this.satisified = false;
		}
	}

	/**
	 * Checks if the command requires the user to have an active vote for the bot.
	 *
	 * @returns A promise that resolves when the vote check is complete.
	 */
	public async voted() {
		if (!this.command.voted) return;

		const user = (this.interaction as Interaction).user || (this.interaction as Message).user;

		if (!user?.voted) {
			this.emit({ type: 'votedCommand', message: 'This command requires you to vote for the bot first.', data: [] });

			this.satisified = false;
		}
	}

	/**
	 * Checks if the command requires the user to have reviewed the bot.
	 *
	 * @returns A promise that resolves when the review check is complete.
	 */
	public async reviewed() {
		if (!this.command.reviewed) return;

		const user = (this.interaction as Interaction).user || (this.interaction as Message).user;

		if (!user?.reviewed) {
			this.emit({ type: 'reviewedCommand', message: 'This command requires you to leave a review for the bot first.', data: [] });

			this.satisified = false;
		}
	}

	/**
	 * Checks if the command requires the user to have tipped credits to the bot.
	 *
	 * @returns A promise that resolves when the tip check is complete.
	 */
	public async tipped() {
		if (!this.command.tipped) return;

		const user = (this.interaction as Interaction).user || (this.interaction as Message).user;
		const tippedAmount = typeof user?.tipped === 'number' ? user.tipped : 0;
		const requiredAmount = typeof this.command.tipped === 'number' ? this.command.tipped : 1;

		if (tippedAmount < requiredAmount) {
			this.emit({
				type: 'tippedCommand',
				message:
					typeof this.command.tipped === 'number'
						? `This command requires you to have tipped at least ${this.command.tipped} credits to the bot.`
						: 'This command requires you to have tipped the bot.',
				data: [String(requiredAmount)],
			});

			this.satisified = false;
		}
	}

	/**
	 * Checks if the command is globally available or restricted to specific guilds.
	 * If the command is not available in the current guild, it emits an error and sets the validation status to false.
	 */
	public global() {
		if (!this.interaction.guild) return;

		if (!this.client.settings.global && !this.client.settings.guildId?.includes(this.interaction.guild?.id)) {
			this.emit({ type: 'localCommand', message: 'This command is not available in this server.', data: this.client.settings.guildId as Array<string> });

			this.satisified = false;
		}
	}

	/**
	 * Emits an error event related to command execution.
	 *
	 * @param error - An object containing details about the error.
	 * @param error.type - The type of error that occurred.
	 * @param error.message - A descriptive message about the error.
	 * @param error.data - Optional additional data related to the error.
	 * @returns A promise that resolves when the error event has been emitted.
	 */
	async emit(error: { type: string; message: string; data?: Array<string> }) {
		return await this.client.emit('commandBlock', this.interaction, this.command, error);
	}

	/**
	 * Validates the command by checking its global availability and premium status.
	 *
	 * @returns A promise that resolves to a boolean indicating whether all validation checks are satisfied.
	 */
	async validate() {
		await this.global();

		await this.premium();

		await this.voted();

		await this.reviewed();

		await this.tipped();

		return this.satisified;
	}
}

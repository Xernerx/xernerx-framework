/** @format */

import { Interaction } from 'discord.js';

import { EventBuilder } from '../build/EventBuilder.js';
import { XernerxUser } from '../model/XernerxUser.js';
import { InteractionUtil } from '../util/InteractionUtil.js';
import { InhibitorValidator } from '../validators/InhibitorValidator.js';

/**
 * Built-in `interactionCreate` event listener that hydrates `interaction.user` (`XernerxUser`)
 * and `interaction.util` (`InteractionUtil`), runs interaction inhibitors, and dispatches
 * specialized interaction events.
 */
export class XernerxInteractionCreateEvent extends EventBuilder {
	/**
	 * Constructs the `XernerxInteractionCreateEvent` listener.
	 */
	constructor() {
		super('XernerxInteractionCreateEvent', {
			name: 'interactionCreate',
			emitter: 'client',
			once: false,
		});
	}

	/**
	 * Processes an incoming Discord interaction and emits specialized framework interaction events.
	 *
	 * @param interaction - The incoming Discord interaction.
	 * @returns A promise that resolves when the interaction has been dispatched.
	 */
	override async run(interaction: Interaction) {
		interaction.user = new XernerxUser(interaction.client, interaction.user);

		await interaction.user.fetchEngagement();

		interaction.util = new InteractionUtil(this.client as Interaction['client'], interaction);

		const inhibitor = new InhibitorValidator(interaction.client);

		if (await inhibitor.pre('interaction', interaction)) return;

		if (interaction.isChatInputCommand()) await interaction.client.emit('slashCommandInteraction', interaction);

		if (interaction.isContextMenuCommand()) await interaction.client.emit('contextCommandInteraction', interaction);

		if (interaction.isAnySelectMenu()) await interaction.client.emit('selectMenuInteraction', interaction);

		if (interaction.isButton()) await interaction.client.emit('buttonInteraction', interaction);

		if (interaction.isModalSubmit()) await interaction.client.emit('modalInteraction', interaction);

		await inhibitor.post('interaction', interaction);
	}
}

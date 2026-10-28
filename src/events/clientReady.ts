/** @format */

import { Client, GatewayVersion, REST, Routes } from 'discord.js';
import sharpyy from 'sharpyy';

import { EventBuilder } from '../build/EventBuilder.js';
import { XernerxClient } from '../client/XernerxClient.js';
import { SlashCommandBuilder } from '../build/SlashCommandBuilder.js';
import { XernerxError } from '../tools/XernerxError.js';
import { XernerxSuccess } from '../tools/XernerxSuccess.js';
import { XernerxInfo } from '../tools/XernerxInfo.js';
import { XernerxUser } from '../model/XernerxUser.js';
import { ContextCommandBuilder } from '../build/ContextCommandBuilder.js';

/**
 * Built-in `clientReady` event listener that triggers cluster readiness, synchronizes
 * owner premium entitlements, and deploys slash and context menu commands to Discord.
 */
export class XernerxClientReadyEvent extends EventBuilder {
	declare private readonly commands: {
		global: Array<SlashCommandBuilder | ContextCommandBuilder>;
		local: Array<SlashCommandBuilder | ContextCommandBuilder>;
	};

	/**
	 * Constructs the `XernerxClientReadyEvent` listener.
	 */
	constructor() {
		super('XernerxClientReadyEvent', {
			name: 'clientReady',
			emitter: 'client',
			once: true,
		});

		this.commands = {
			global: [],
			local: [],
		};
	}

	/**
	 * Executes when the Discord client becomes ready, synchronizing entitlements and partitioning commands for deployment.
	 *
	 * @param client - The ready `XernerxClient` instance.
	 * @returns A promise that resolves when startup tasks have completed.
	 */
	override async run(client: XernerxClient) {
		client.cluster?.triggerReady();

		// premium for owners

		if (client.settings.owners?.length) {
			const owners = [];

			if (client.premium?.synchronize) new XernerxInfo(`Synchronizing entitlements for premium owners...`);

			for (const owner of client.settings.owners) {
				const user = await client.users.fetch(owner).catch(() => null);
				if (!user) continue;

				new XernerxUser(client as Client<true>, user).synchronize();

				owners.push(user);
			}

			if (client.premium?.synchronize) new XernerxSuccess(`Successfully synchronized entitlements for ${owners.map((owner) => owner.username).join(',')}`);
		}

		// interaction commands
		try {
			const commands = [...client.commands.slash, ...client.commands.context].map(([, command]) => command);

			if (!client.settings.global) {
				this.commands.global = [];
				this.commands.local = commands;
			} else {
				this.commands.global = commands.filter((command) => command.deploy?.global);
				this.commands.local = commands.filter((command) => !command.deploy?.global);
			}

			this.put(client);
		} catch (error) {
			new XernerxError((error as Error).message);
		}
	}

	/**
	 * Deploys global and guild-scoped application commands to the Discord REST API.
	 *
	 * @param client - The `XernerxClient` instance whose application commands are being deployed.
	 * @returns A promise that resolves when command deployment completes.
	 */
	async put(client: XernerxClient) {
		const rest = new REST({ version: GatewayVersion }).setToken(client.token);

		if (this.commands.global.length) {
			if (!client.settings.global) return new XernerxInfo('Loading commands locally');

			await rest.put(Routes.applicationCommands(client.user?.id as string), { body: this.commands.global.map((command) => command.data.toJSON()) });

			new XernerxSuccess(`Successfully deployed commands globally.`);
		}

		if (this.commands.local.length) {
			const guilds: { [index: string]: Array<SlashCommandBuilder | ContextCommandBuilder> } = {};

			for (const command of this.commands.local) {
				(command.deploy?.guilds as Array<string>)?.map((id) => (guilds[id] ? guilds[id].push(command) : (guilds[id] = [command])));
			}

			if (!client.settings.guildId?.length && !Object.keys(guilds).length) return new XernerxError('Cannot locally deploy commands without a guild ID');

			(client.settings.guildId as Array<string>).map((id: string) => (guilds[id] ? guilds[id] : (guilds[id] = this.commands.local)));

			for (const [guildId, commands] of Object.entries(guilds)) {
				try {
					await rest.put(Routes.applicationGuildCommands(client.user?.id as string, guildId), { body: commands.map((command) => command.data.toJSON()) });

					new XernerxInfo(`Successfully deployed commands locally in guild ${sharpyy(guildId, 'txBlue')}: ${commands.map((command) => sharpyy(command.id, 'txYellow')).join(', ')}`);
				} catch (error) {
					new XernerxError(`Failed to deploy commands locally in guild ${sharpyy(guildId, 'txBlue')}: ${(error as Error).message}`);
				}
			}
		}
	}
}

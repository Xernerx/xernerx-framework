<!-- @format -->

![Xernerx Banner](https://xernerx.com/banner.png)

# @xernerx/framework

`@xernerx/framework` is a modern TypeScript framework for `discord.js` built by **Xernerx Studios**. It provides builders and handlers for slash commands, message commands, context menu commands, events, inhibitors, and extensions—alongside built-in Discord monetization, hybrid sharding, and Xernerx user engagement gating (`voted`, `reviewed`, `tipped`).

---

## Features

- **Modular Builders & Handlers**: Build and organize your bot with `XernerxClient`, `XernerxShardClient`, `SlashCommandBuilder`, `MessageCommandBuilder`, `ContextCommandBuilder`, `EventBuilder`, and `InhibitorBuilder`.
- **Built-in Engagement & Monetization Requirements**: Gate any command behind Discord premium entitlements (`premium`), bot votes (`voted`), reviews (`reviewed`), or credit tips (`tipped: true | number`).
- **Hydrated `XernerxUser`**: Every `interaction.user` and `message.user` is automatically wrapped in `XernerxUser`, exposing `.voted`, `.reviewed`, `.tipped`, `.premium()`, and `.fetchEngagement()` backed by an in-memory 15-minute TTL cache and optional real-time `@xernerx/hooks` integration.
- **Event Builder & Custom Emitters**: Listen to Discord client events, Node.js `process` events, framework lifecycle events (`commandStart`, `commandFinish`, `commandBlock`, `commandError`), or custom emitters like `'hooks'`.
- **Inhibitor Builder**: Intercept interactions and commands with `pre` and `post` hooks via `InhibitorBuilder`.
- **Extension System**: Plug in official and custom extensions (`@xernerx/commands`, `@xernerx/stats`, `@xernerx/hooks`) through `this.modules.extensionHandler.loadExtensions(...)`.
- **Hybrid Sharding**: Scale effortlessly across multiple processes and clusters with `XernerxShardClient` powered by `discord-hybrid-sharding`.
- **Interaction & Message Utilities**: Convenient `interaction.util` and `message.util` helpers for replying, editing, deleting, webhook sending, and Discord Components V2 (`display: true`).

---

## Install

```bash
pnpm add @xernerx/framework discord.js @discordjs/core
```

```bash
npm install @xernerx/framework discord.js @discordjs/core
```

---

## Setup

Extend `XernerxClient` and configure your handlers, extensions, and connection:

```ts
import path from 'node:path';
import { GatewayIntentBits } from 'discord.js';
import { XernerxClient } from '@xernerx/framework';
import { Terminal } from '@xernerx/terminal';

export class Client extends XernerxClient {
	private readonly logger = new Terminal({ scope: 'XF', tag: 'Client' });

	constructor() {
		super({
			intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
			token: process.env.DISCORD_TOKEN!,
			global: true,
			guildId: ['123456789012345678'], // Local/development guild IDs (up to 5)
			owners: ['987654321098765432'], // Bot owner user IDs (up to 5)
			premium: {
				owners: true, // Grant test entitlements to owners on startup
				consume: false, // Consume consumable SKUs automatically
				synchronize: true, // Synchronize owner entitlements when ready
			},
		});

		// Load events
		this.modules.eventHandler.loadEvents({
			directory: path.resolve('./dist/events'),
		});

		// Load slash, message, and context menu commands
		this.modules.commandHandler.loadSlashCommands({
			directory: path.resolve('./dist/commands/slash'),
		});

		this.modules.commandHandler.loadMessageCommands({
			directory: path.resolve('./dist/commands/message'),
			prefix: ['!', '?'],
			mention: true,
			handleEdits: true,
			handleDeletions: true,
			ignore: {
				bots: true,
				self: true,
				system: true,
			},
		});

		this.modules.commandHandler.loadContextCommands({
			directory: path.resolve('./dist/commands/context'),
		});

		// Load inhibitors
		this.modules.inhibitorHandler.loadInhibitors({
			directory: path.resolve('./dist/inhibitors'),
		});

		// Connect to Discord
		this.connect();
		this.logger.info('Connected XernerxClient.');
	}
}

new Client();
```

---

## Sharding (`XernerxShardClient`)

To scale your bot across multiple clusters and shards, extend `XernerxShardClient` and point it to your compiled client entry file:

```ts
import path from 'node:path';
import { XernerxShardClient } from '@xernerx/framework';

export class ShardManager extends XernerxShardClient {
	constructor() {
		super({
			file: path.resolve('./dist/bot.js'),
			token: process.env.DISCORD_TOKEN!,
			totalShards: 'auto',
			shardsPerClusters: 2,
		});
	}
}

new ShardManager();
```

`XernerxClient` automatically detects when it is spawned under `XernerxShardClient` and aggregates `guildCount`, `userCount`, and per-shard statistics in `this.stats`.

---

## Command Builders

All command builders support a rich set of requirement and restriction options:

| Option        | Type                                                | Description                                                                                                     |
| ------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `premium`     | `boolean`                                           | Requires the user to hold an active Discord SKU entitlement for the bot.                                        |
| `voted`       | `boolean`                                           | Requires the user to have an active vote for the bot on Xernerx.                                                |
| `reviewed`    | `boolean`                                           | Requires the user to have left a review for the bot on Xernerx.                                                 |
| `tipped`      | `boolean \| number`                                 | Requires the user to have tipped the bot (`true` for at least `1` credit, or a specific minimum credit amount). |
| `cooldown`    | `number`                                            | Cooldown duration for the command (default `0`).                                                                |
| `permissions` | `{ client?, user? }`                                | Required Discord permissions for the bot client and the invoking user.                                          |
| `strict`      | `{ owner?, users?, channels?, guilds?, types? }`    | Whitelist restrictions limiting execution to specific owners, users, channels, guilds, or channel types.        |
| `ignore`      | `{ owner?, users?, channels?, guilds?, types? }`    | Blacklist rules ignoring specific owners, users, channels, guilds, or channel types.                            |
| `deploy`      | `{ global?: boolean, guilds?: string \| string[] }` | Controls whether the command is deployed globally (`true` by default) or only to specific guild IDs.            |

### Slash Commands (`SlashCommandBuilder`)

```ts
import { SlashCommandBuilder, type SlashCommandOptions, type SlashCommandAutocomplete, type SlashCommandError } from '@xernerx/framework';

export default class RewardCommand extends SlashCommandBuilder {
	constructor() {
		super('reward', {
			name: 'reward',
			description: 'Claim your supporter reward!',
			category: 'Rewards',
			defer: true,
			voted: true,
			reviewed: false,
			tipped: 10, // Requires at least 10 credits tipped
			cooldown: 60,
			permissions: {
				client: ['SendMessages', 'EmbedLinks'],
				user: ['SendMessages'],
			},
			deploy: {
				global: true,
			},
			options: [
				{
					type: 'string',
					name: 'tier',
					description: 'Select the reward tier to claim',
					required: true,
					autocomplete: true,
				},
			],
		});
	}

	override async autocomplete({ interaction, focused }: SlashCommandAutocomplete) {
		const choices = ['bronze', 'silver', 'gold'].filter((t) => t.startsWith(focused.value.toLowerCase()));
		await interaction.respond(choices.map((choice) => ({ name: choice, value: choice })));
	}

	override async conditions({ interaction }: SlashCommandOptions) {
		// Return true to halt execution before exec() runs
		return false;
	}

	override async exec({ interaction, options }: SlashCommandOptions) {
		const tier = options.tier?.value;
		await interaction.util.reply({
			content: `You claimed the **${tier}** reward! (Total tipped: ${interaction.user.tipped} credits)`,
			ephemeral: true,
		});
	}

	override async error({ interaction, error }: SlashCommandError) {
		await interaction.util.reply({
			content: `Something went wrong: ${error.message}`,
			ephemeral: true,
		});
	}
}
```

### Message Commands (`MessageCommandBuilder`)

```ts
import { Message } from 'discord.js';
import { MessageCommandBuilder } from '@xernerx/framework';

export default class PingMessageCommand extends MessageCommandBuilder {
	constructor() {
		super('ping-message', {
			name: 'ping',
			alias: ['pong', 'latency'],
			prefix: ['!'],
			description: 'Check the bot latency.',
			voted: false,
			strict: {
				owner: false,
			},
		});
	}

	override async exec(message: Message, args: string[]) {
		await message.util.reply(`Pong! Latency: \`${this.client.ws.ping}ms\``);
	}
}
```

### Context Menu Commands (`ContextCommandBuilder`)

```ts
import { ApplicationCommandType } from 'discord.js';
import { ContextCommandBuilder, type ContextCommandOptions } from '@xernerx/framework';

export default class UserProfileContextCommand extends ContextCommandBuilder {
	constructor() {
		super('user-profile', {
			name: 'View Engagement Profile',
			description: 'Inspect a user’s Xernerx engagement status',
			type: ApplicationCommandType.User,
			defer: true,
		});
	}

	override async exec({ interaction, user }: ContextCommandOptions<'user'>) {
		await interaction.util.reply({
			content: [`**User:** ${user.tag}`, `**Voted:** ${user.voted ? 'Yes' : 'No'}`, `**Reviewed:** ${user.reviewed ? `Yes (${user.rating}/5)` : 'No'}`, `**Tipped:** ${user.tipped} credits`].join(
				'\n'
			),
			ephemeral: true,
		});
	}
}
```

---

## User Engagement & Monetization (`XernerxUser`)

Every interaction and message automatically wraps the triggering user (and target user in user context menu commands) in a `XernerxUser` instance:

```ts
// Engagement properties (hydrated automatically before command execution)
interaction.user.voted; // boolean
interaction.user.lastVotedAt; // string | null (ISO timestamp)
interaction.user.nextVoteAt; // string | null (ISO timestamp)
interaction.user.reviewed; // boolean
interaction.user.rating; // number | null
interaction.user.tipped; // number (total credits tipped)

// Force-refresh engagement state from the Xernerx API (bypasses TTL cache)
await interaction.user.fetchEngagement(true);

// Discord Monetization / Entitlements
const isPremium = await interaction.user.premium(interaction.user.id);
const entitlements = await interaction.user.entitlements();
```

### How Caching & `@xernerx/hooks` Integration Work

1. **With `@xernerx/hooks` loaded**: `this.client.resolveUserEngagement()` delegates directly to the `XernerxHooks` extension, which keeps the cache updated in real time as `vote`, `review`, and `tip` webhooks arrive.
2. **Standalone (without `@xernerx/hooks`)**: `XernerxClient` maintains an automatic in-memory TTL cache (`this.client.userEngagementCache`, 15-minute TTL, automatic `nextVoteAt` expiration) and falls back to `GET https://api.xernerx.com/v1/bots/:botId/users/:userId`.

---

## Event Builder (`EventBuilder`)

Use `EventBuilder` to listen to Discord client events, framework events, or custom emitters attached to the client (such as `'hooks'` when using `@xernerx/hooks`).

### Handling Blocked Commands (`commandBlock`)

When a command fails a built-in validator check, `XernerxClient` emits the `commandBlock` event with one of the following `error.type` reasons:

- `'localCommand'` — The command is restricted to configured `guildId` servers.
- `'premiumCommand'` — The command requires an active Discord premium entitlement (`premium: true`).
- `'votedCommand'` — The command requires an active vote (`voted: true`).
- `'reviewedCommand'` — The command requires a bot review (`reviewed: true`).
- `'tippedCommand'` — The command requires tipping the bot (`tipped: true | number`). `error.data[0]` contains the required credit amount.

```ts
import { Interaction, Message } from 'discord.js';
import { EventBuilder, SlashCommandBuilder, MessageCommandBuilder, ContextCommandBuilder } from '@xernerx/framework';

export default class CommandBlockEvent extends EventBuilder {
	constructor() {
		super('commandBlock', {
			name: 'commandBlock',
			emitter: 'client',
			once: false,
		});
	}

	override async run(interaction: Interaction | Message, command: SlashCommandBuilder | MessageCommandBuilder | ContextCommandBuilder, error: { type: string; message: string; data?: string[] }) {
		switch (error.type) {
			case 'localCommand':
			case 'premiumCommand':
			case 'votedCommand':
			case 'reviewedCommand':
			case 'tippedCommand': {
				if ('util' in interaction) {
					await interaction.util.reply({
						content: error.message,
						ephemeral: true,
					});
				}
				break;
			}
		}
	}
}
```

### Listening to Custom Emitters (`'hooks'`)

```ts
import { EventBuilder } from '@xernerx/framework';
import { Terminal } from '@xernerx/terminal';
import type { VoteWebhookPayload } from '@xernerx/hooks';

export default class VoteEvent extends EventBuilder {
	private readonly console = new Terminal({ scope: 'XH' });

	constructor() {
		super('voteEvent', {
			name: 'vote',
			emitter: 'hooks',
			once: false,
		});
	}

	override async run(payload: VoteWebhookPayload) {
		this.console.info(`User ${payload.userId} voted for bot ${payload.botId}!`);
	}
}
```

---

## Inhibitor Builder (`InhibitorBuilder`)

Inhibitors allow you to run custom `pre` and `post` hooks around every `'interaction'` or `'command'`. Returning `true` (or any truthy value) from `pre` halts execution.

```ts
import { Interaction } from 'discord.js';
import { InhibitorBuilder, SlashCommandBuilder } from '@xernerx/framework';

export default class CommandInhibitor extends InhibitorBuilder {
	constructor() {
		super('commandInhibitor', {
			name: 'command', // 'interaction' | 'command'
		});
	}

	override async pre(interaction: Interaction, command: SlashCommandBuilder) {
		// Return true to block the command from running
		if (interaction.user.bot) return true;
		return false;
	}

	override async post(interaction: Interaction, command: SlashCommandBuilder) {
		// Executed after the command finishes
	}
}
```

---

## Extensions (`ExtensionHandler`)

Load official Xernerx extensions—such as `@xernerx/commands`, `@xernerx/stats`, and `@xernerx/hooks`—using `this.modules.extensionHandler.loadExtensions(...)`:

```ts
import { XernerxClient } from '@xernerx/framework';
import { XernerxCommands } from '@xernerx/commands';
import { XernerxStats } from '@xernerx/stats';
import { XernerxHooks } from '@xernerx/hooks';

export class Client extends XernerxClient {
	constructor() {
		super({
			intents: ['Guilds', 'GuildMessages', 'MessageContent'],
			token: process.env.DISCORD_TOKEN!,
		});

		this.modules.extensionHandler.loadExtensions(
			new XernerxCommands(this, {
				token: process.env.XERNERX_API_TOKEN!,
			}),
			new XernerxStats(this, {
				token: process.env.XERNERX_API_TOKEN!,
			}),
			new XernerxHooks(this, {
				secret: process.env.XERNERX_WEBHOOK_SECRET!,
				token: process.env.XERNERX_API_TOKEN,
				port: 3080,
				path: '/xernerx/hooks',
			})
		);

		this.connect();
	}
}

new Client();
```

---

## Documentation & API Reference

Full documentation, guides, and TypeScript symbol references are available on the **[Xernerx Documentation](https://docs.xernerx.com)** and the **[`@xernerx/framework` Package Reference](https://docs.xernerx.com/packages/@xernerx/framework)**.

### Package Symbols (`@xernerx/framework`)

- **Clients**:
  - [`XernerxClient`](https://docs.xernerx.com/packages/@xernerx/framework#class-XernerxClient) — Core Discord.js bot client with modular handlers, monetization, and engagement caching.
  - [`XernerxShardClient`](https://docs.xernerx.com/packages/@xernerx/framework#class-XernerxShardClient) — Hybrid cluster/shard manager (`discord-hybrid-sharding`).
- **Builders**:
  - [`BaseBuilder`](https://docs.xernerx.com/packages/@xernerx/framework#class-BaseBuilder) — Abstract base builder class.
  - [`SlashCommandBuilder`](https://docs.xernerx.com/packages/@xernerx/framework#class-SlashCommandBuilder) — Chat input slash command builder (`options`, `subcommands`, `autocomplete`, `conditions`, `exec`, `error`).
  - [`MessageCommandBuilder`](https://docs.xernerx.com/packages/@xernerx/framework#class-MessageCommandBuilder) — Prefix and mention message command builder.
  - [`ContextCommandBuilder`](https://docs.xernerx.com/packages/@xernerx/framework#class-ContextCommandBuilder) — User and Message context menu command builder.
  - [`EventBuilder`](https://docs.xernerx.com/packages/@xernerx/framework#class-EventBuilder) — Event listener builder supporting `client`, `process`, and custom emitters (`'hooks'`).
  - [`InhibitorBuilder`](https://docs.xernerx.com/packages/@xernerx/framework#class-InhibitorBuilder) — Pre/post execution interceptor builder for interactions and commands.
- **Handlers**:
  - [`BaseHandler`](https://docs.xernerx.com/packages/@xernerx/framework#class-BaseHandler) — Base directory and module loader.
  - [`CommandHandler`](https://docs.xernerx.com/packages/@xernerx/framework#class-CommandHandler) — Loads and registers slash, message, and context menu commands.
  - [`EventHandler`](https://docs.xernerx.com/packages/@xernerx/framework#class-EventHandler) — Loads and binds event listeners across emitters.
  - [`ExtensionHandler`](https://docs.xernerx.com/packages/@xernerx/framework#class-ExtensionHandler) — Loads framework extensions (`@xernerx/commands`, `@xernerx/stats`, `@xernerx/hooks`).
  - [`InhibitorHandler`](https://docs.xernerx.com/packages/@xernerx/framework#class-InhibitorHandler) — Loads and executes `pre` and `post` inhibitors.
- **Models & Utilities**:
  - [`XernerxUser`](https://docs.xernerx.com/packages/@xernerx/framework#class-XernerxUser) — Enriched user wrapper with `.voted`, `.reviewed`, `.tipped`, `.rating`, `.fetchEngagement()`, and `.premium()`.
  - [`XernerxGuild`](https://docs.xernerx.com/packages/@xernerx/framework#class-XernerxGuild) — Guild wrapper model.
  - [`XernerxMonitisation`](https://docs.xernerx.com/packages/@xernerx/framework#class-XernerxMonitisation) — Discord SKU & entitlement manager.
  - [`InteractionArguments`](https://docs.xernerx.com/packages/@xernerx/framework#class-InteractionArguments) — Parsed slash command option arguments.
  - [`BaseUtil`](https://docs.xernerx.com/packages/@xernerx/framework#class-BaseUtil) | [`InteractionUtil`](https://docs.xernerx.com/packages/@xernerx/framework#class-InteractionUtil) | [`MessageUtil`](https://docs.xernerx.com/packages/@xernerx/framework#class-MessageUtil) — Reply, edit, delete, and webhook utilities.
- **Validators**:
  - [`BaseValidator`](https://docs.xernerx.com/packages/@xernerx/framework#class-BaseValidator) | [`SlashCommandValidator`](https://docs.xernerx.com/packages/@xernerx/framework#class-SlashCommandValidator) | [`ContextCommandValidator`](https://docs.xernerx.com/packages/@xernerx/framework#class-ContextCommandValidator) | [`InhibitorValidator`](https://docs.xernerx.com/packages/@xernerx/framework#class-InhibitorValidator)
- **Interfaces**:
  - [`XernerxClientOptions`](https://docs.xernerx.com/packages/@xernerx/framework#interface-XernerxClientOptions) | [`XernerxShardClientOptions`](https://docs.xernerx.com/packages/@xernerx/framework#interface-XernerxShardClientOptions) | [`XernerxClientStats`](https://docs.xernerx.com/packages/@xernerx/framework#interface-XernerxClientStats) | [`UserEngagementData`](https://docs.xernerx.com/packages/@xernerx/framework#interface-UserEngagementData)
  - [`SlashCommandBuilderOptions`](https://docs.xernerx.com/packages/@xernerx/framework#interface-SlashCommandBuilderOptions) | [`SlashCommandOptions`](https://docs.xernerx.com/packages/@xernerx/framework#interface-SlashCommandOptions) | [`SlashCommandHandlerOptions`](https://docs.xernerx.com/packages/@xernerx/framework#interface-SlashCommandHandlerOptions)
  - [`MessageCommandBuilderOptions`](https://docs.xernerx.com/packages/@xernerx/framework#interface-MessageCommandBuilderOptions) | [`MessageCommandHandlerOptions`](https://docs.xernerx.com/packages/@xernerx/framework#interface-MessageCommandHandlerOptions)
  - [`ContextCommandBuilderOptions`](https://docs.xernerx.com/packages/@xernerx/framework#interface-ContextCommandBuilderOptions) | [`ContextCommandOptions`](https://docs.xernerx.com/packages/@xernerx/framework#interface-ContextCommandOptions) | [`ContextCommandHandlerOptions`](https://docs.xernerx.com/packages/@xernerx/framework#interface-ContextCommandHandlerOptions)
  - [`EventBuilderOptions`](https://docs.xernerx.com/packages/@xernerx/framework#interface-EventBuilderOptions) | [`EventHandlerOptions`](https://docs.xernerx.com/packages/@xernerx/framework#interface-EventHandlerOptions)
  - [`InhibitorBuilderOptions`](https://docs.xernerx.com/packages/@xernerx/framework#interface-InhibitorBuilderOptions) | [`InhibitorHandlerOptions`](https://docs.xernerx.com/packages/@xernerx/framework#interface-InhibitorHandlerOptions)

### Ecosystem & Platform Documentation

- [Xernerx Documentation Home](https://docs.xernerx.com)
- [All Xernerx Packages](https://docs.xernerx.com/packages)
- [`xernerx` Collection](https://docs.xernerx.com/packages/xernerx)
- [`@xernerx/commands` Documentation](https://docs.xernerx.com/packages/@xernerx/commands)
- [`@xernerx/hooks` Documentation](https://docs.xernerx.com/packages/@xernerx/hooks)
- [`@xernerx/stats` Documentation](https://docs.xernerx.com/packages/@xernerx/stats)
- [`@xernerx/terminal` Documentation](https://docs.xernerx.com/packages/@xernerx/terminal)
- [`@xernerx/websocket` Documentation](https://docs.xernerx.com/packages/@xernerx/websocket)
- [REST API v1 Reference](https://docs.xernerx.com/api/v1)
- [WebSocket Gateway Documentation](https://docs.xernerx.com/websocket)
- [Release Changelog](https://info.xernerx.com/changelog#@xernerx/framework)

---

## Support & Links

- [Discord Support Server](https://xernerx.com/discord)
- [`@xernerx/framework` Package Documentation](https://docs.xernerx.com/packages/@xernerx/framework)
- [Xernerx Developer Portal](https://portal.xernerx.com)
- [Xernerx Website](https://xernerx.com)

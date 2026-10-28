/** @format */

// Message command handler options
/**
 * Configuration options for loading and handling message commands via `CommandHandler.loadMessageCommands`.
 */
export interface MessageCommandHandlerOptions {
	/** Directory path containing compiled message command files, or `null` if unset. */
	directory: string | null;
	/** Global prefix or array of prefixes recognized by the message command handler. */
	prefix?: string | string[];
	/** Whether mentioning the bot can be used as a command trigger prefix. */
	mention?: boolean;
	/** Character or string used to split command arguments (defaults to `' '`). */
	seperator?: string;
	/** Whether editing a command message should update the bot's cached response message. */
	handleEdits?: boolean;
	/** Whether deleting a command message should delete the bot's cached response message. */
	handleDeletions?: boolean;
	/** Author filter settings specifying which message sources to ignore. */
	ignore?: {
		/** Whether to ignore Discord system messages (defaults to `true`). */
		system?: boolean;
		/** Whether to ignore messages sent by bot accounts (defaults to `true`). */
		bots?: boolean;
		/** Whether to ignore messages sent by this bot itself (defaults to `true`). */
		self?: boolean;
	};
}

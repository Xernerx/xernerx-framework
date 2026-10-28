/** @format */

// Slash command handler options
/**
 * Configuration options for loading slash commands via `CommandHandler.loadSlashCommands`.
 */
export interface SlashCommandHandlerOptions {
	/** Directory path containing compiled slash command files, or `null` if unset. */
	directory: string | null;
}

/** @format */

// Context command handler options
/**
 * Configuration options for loading context menu commands via `CommandHandler.loadContextCommands`.
 */
export interface ContextCommandHandlerOptions {
	/** Directory path containing compiled context menu command files, or `null` if unset. */
	directory: string | null;
}

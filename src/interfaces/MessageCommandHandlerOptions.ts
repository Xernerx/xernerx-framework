/** @format */

// Message command handler options
export interface MessageCommandHandlerOptions {
	directory: string | null;
	prefix?: string | string[];
	mention?: boolean;
	seperator?: string;
	handleEdits?: boolean;
	handleDeletions?: boolean;
	ignore?: {
		system?: boolean;
		bots?: boolean;
		self?: boolean;
	};
}

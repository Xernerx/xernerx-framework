/** @format */

// Client configuration options
export interface XernerxClientOptions {
	token: string;
	global?: boolean;
	guildId?: string | Array<string>;
	owners?: string | Array<string>;
	premium?: {
		owners?: boolean; // grant premium to users when starting bot
		consume?: boolean; // consume on buy
		synchronize?: boolean; // synchronize entitlements on startup
	};
}

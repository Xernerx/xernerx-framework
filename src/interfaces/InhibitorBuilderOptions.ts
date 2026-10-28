/** @format */

// Inhibitor builder options
/**
 * Configuration options for defining an inhibitor with `InhibitorBuilder`.
 */
export interface InhibitorBuilderOptions {
	/** The lifecycle stage this inhibitor intercepts (`'interaction'` or `'command'`). */
	name: 'interaction' | 'command';
}

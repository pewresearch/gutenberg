/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { desktop, tablet, mobile } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { registerBlockVisibilityCondition } from './condition-registry';

/**
 * Register the built-in viewport visibility condition.
 * This condition allows blocks to be hidden based on the viewport size.
 */
registerBlockVisibilityCondition( 'viewport', {
	label: __( 'Viewport' ),
	priority: 0, // Built-in viewport condition comes first.
	options: [
		{
			key: 'desktop',
			label: __( 'Desktop' ),
			icon: desktop,
		},
		{
			key: 'tablet',
			label: __( 'Tablet' ),
			icon: tablet,
		},
		{
			key: 'mobile',
			label: __( 'Mobile' ),
			icon: mobile,
		},
	],
	description: __(
		'Block will be hidden according to the selected viewports. It will be included in the published markup on the frontend.'
	),
} );

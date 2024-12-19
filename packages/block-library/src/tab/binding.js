/**
 * WordPress dependencies
 */
import {
	registerBlockVariation,
	registerBlockBindingsSource,
} from '@wordpress/blocks';

export default function registerTabLabelBinding() {
	const allowedAttributes = [ 'content' ];
	registerBlockBindingsSource( {
		name: 'tab/label',
		usesContext: [ 'tab/label' ],
		getValues( { bindings } ) {
			const values = {};
			for ( const [ attributeName, source ] of Object.entries(
				bindings
			) ) {
				if ( allowedAttributes.includes( source.args.key ) ) {
					values[ attributeName ] = 'Tab Title !';
				}
			}
			return values;
		},
	} );
	registerBlockVariation( 'core/paragraph', {
		name: 'core-tab-label',
		title: 'Tab: Label',
		category: 'design',
		attributes: {
			content: 'Tab Label',
			metadata: {
				bindings: {
					content: {
						source: 'core/tab',
						args: {
							contextKey: 'tab/label',
						},
					},
				},
			},
		},
	} );
	registerBlockVariation( 'core/heading', {
		name: 'core-tab-label',
		title: 'Tab: Label',
		category: 'design',
		attributes: {
			content: 'Tab Label',
			level: 3,
			metadata: {
				bindings: {
					content: {
						source: 'core/tab',
						args: {
							contextKey: 'tab/label',
						},
					},
				},
			},
		},
	} );
};

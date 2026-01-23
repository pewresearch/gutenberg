/**
 * WordPress dependencies
 */
import { useStyleOverride } from '@wordpress/block-editor';

const calculatePositionStyles = ( position ) => {
	switch ( position ) {
		case 'top left':
			return `margin-top: 1em; margin-left: 1em;`;
		case 'top center':
			return `margin-top: 1em;`;
		case 'top right':
			return `margin-top: 1em; margin-right: 1em;`;
		case 'center left':
			return `margin-left: 1em;`;
		case 'center right':
			return `margin-right: 1em;`;
		case 'bottom left':
			return `margin-bottom: 1em; margin-left: 1em;`;
		case 'bottom center':
			return `margin-bottom: 1em;`;
		case 'bottom right':
			return `margin-bottom: 1em; margin-right: 1em;`;
		default:
			return '';
	}
};

/**
 * Injects animation and position CSS custom properties for the dialog-element block.
 *
 * @param {Object} props
 * @param {Object} props.attributes Block attributes
 * @param {string} props.clientId   Block client ID
 * @return {null} No UI output
 */
export default function StyleEngine( { attributes, clientId } ) {
	const { animationDuration, dialogPosition } = attributes || {};

	const cssMap = {
		'--wp--style--dialog-animation-duration': animationDuration
			? `${ animationDuration }ms`
			: null,
	};

	// Build scoped CSS only for defined values to avoid unnecessary empty declarations.
	let declarations = Object.entries( cssMap )
		.filter( ( [ , value ] ) => !! value )
		.map( ( [ name, value ] ) => `\t${ name }: ${ value };` )
		.join( '\n' );

	declarations += calculatePositionStyles( dialogPosition );

	useStyleOverride( {
		css:
			declarations.length && clientId
				? `#block-${ clientId } {\n${ declarations }\n}`
				: '',
	} );

	return null;
}

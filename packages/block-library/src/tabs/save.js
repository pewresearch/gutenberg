/**
 * External dependencies
 *
 */
/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import {
	useBlockProps,
	useInnerBlocksProps,
	__experimentalGetElementClassName as getElementClassName,
} from '@wordpress/block-editor';

export default function Save( {} ) {
	// eslint-disable-next-line react-compiler/react-compiler
	const blockProps = useBlockProps.save( {
		className: clsx( getElementClassName( 'tabs' ) ),
	} );

	// eslint-disable-next-line react-compiler/react-compiler
	const innerBlocksProps = useInnerBlocksProps.save( {} );

	return (
		<div { ...blockProps }>
			<h3 className="tabs__title">Contents</h3>
			<ul className="tabs__list"></ul>
			{ innerBlocksProps.children }
		</div>
	);
}

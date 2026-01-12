/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function Save() {
	// Container props for the tablist
	const blockProps = useBlockProps.save( {
		className: clsx( 'wp-block-tabs-menu', 'tabs__list' ),
		role: 'tablist',
	} );

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
}

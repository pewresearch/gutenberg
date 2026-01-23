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
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';

const TEMPLATE = [
	[
		'core/dialog-element',
		{
			lock: {
				move: true,
				remove: true,
			},
		},
	],
];

export default function Edit( { clientId, context } ) {
	const isDialogOpen = context[ 'core/dialog-is-open' ] ?? false;

	const { selectBlock, updateBlockAttributes } =
		useDispatch( blockEditorStore );

	// Get the root dialog block client ID to update its attributes
	const dialogRootClientId = useSelect(
		( select ) => {
			const { getBlockParentsByBlockName } = select( blockEditorStore );
			const dialogParents = getBlockParentsByBlockName(
				clientId,
				'core/dialog'
			);
			return dialogParents[ 0 ] || null;
		},
		[ clientId ]
	);

	const handleBackdropClick = ( event ) => {
		// Only close if clicking directly on the backdrop, not on child elements
		if ( event.target === event.currentTarget && dialogRootClientId ) {
			updateBlockAttributes( dialogRootClientId, {
				editorIsOpen: false,
			} );
			selectBlock( dialogRootClientId );
		}
	};

	const blockProps = useBlockProps( {
		className: clsx( 'wp-block-dialog-backdrop', {
			'is-dialog-open': isDialogOpen,
		} ),
		onClick: handleBackdropClick,
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
		templateLock: 'all',
	} );

	return <div { ...innerBlocksProps } />;
}

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

/**
 * Internal dependencies
 */
import { STORE_NAME } from '../dialog/store';

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

export default function Edit( { clientId } ) {
	const { selectBlock } = useDispatch( blockEditorStore );
	const { close } = useDispatch( STORE_NAME );

	const { rootClientId, dialogElementClientId, isDialogOpen } = useSelect(
		( select ) => {
			const { getBlock, getBlockRootClientId } =
				select( blockEditorStore );
			const block = getBlock( clientId );
			const dialogElementBlock = block?.innerBlocks?.find(
				( innerBlock ) => innerBlock.name === 'core/dialog-element'
			);
			const dialogElementId = dialogElementBlock?.clientId;

			return {
				rootClientId: getBlockRootClientId( clientId ),
				dialogElementClientId: dialogElementId,
				isDialogOpen: dialogElementId
					? select( STORE_NAME ).isOpen( dialogElementId )
					: false,
			};
		},
		[ clientId ]
	);

	const handleBackdropClick = ( event ) => {
		// Only close if clicking directly on the backdrop, not on child elements
		if ( event.target === event.currentTarget && dialogElementClientId ) {
			close( dialogElementClientId );
			selectBlock( rootClientId );
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

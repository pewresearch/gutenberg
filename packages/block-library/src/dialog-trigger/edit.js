/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import {
	BlockControls,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';

export default function Edit( { context, clientId } ) {
	const dialogId = context[ 'core/dialog-id' ] ?? '';
	const isDialogOpen = context[ 'core/dialog-is-open' ] ?? false;

	const { updateBlockAttributes } = useDispatch( blockEditorStore );

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

	const toggleDialog = () => {
		if ( dialogRootClientId ) {
			updateBlockAttributes( dialogRootClientId, {
				editorIsOpen: ! isDialogOpen,
			} );
		}
	};

	const blockProps = useBlockProps( {
		'aria-haspopup': 'dialog',
		'aria-controls': dialogId,
		'aria-expanded': isDialogOpen ? 'true' : 'false',
		type: 'button',
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		templateLock: false,
	} );

	const buttonLabel = useMemo(
		() => ( isDialogOpen ? __( 'Close Dialog' ) : __( 'Edit Dialog' ) ),
		[ isDialogOpen ]
	);

	return (
		<>
			<BlockControls __experimentalShareWithChildBlocks>
				<ToolbarGroup>
					<ToolbarButton
						label={ buttonLabel }
						aria-controls={ dialogId }
						onClick={ toggleDialog }
					>
						{ buttonLabel }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<button { ...innerBlocksProps } />
		</>
	);
}

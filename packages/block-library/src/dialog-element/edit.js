/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { Icon, cancelCircleFilled } from '@wordpress/icons';
import { useRef, useEffect } from '@wordpress/element';
import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { KeyboardShortcuts } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { Toolbar, InspectorPanel } from './controls';
import StyleEngine from './style-engine';

function Edit( { attributes, setAttributes, clientId, context, className } ) {
	const { dialogSize = 'medium', animation = 'fade' } = attributes;
	const isOpen = context[ 'core/dialog-is-open' ] ?? false;

	const { selectBlock, updateBlockAttributes } =
		useDispatch( blockEditorStore );

	const dialogRootClientId = useSelect(
		( select ) => {
			const { getBlockParentsByBlockName } = select( blockEditorStore );
			// Get the root dialog block client ID to update its attributes
			const dialogParents = getBlockParentsByBlockName(
				clientId,
				'core/dialog'
			);
			return dialogParents[ 0 ] || null;
		},
		[ clientId ]
	);

	/**
	 * Setup ref for the dialog.
	 */
	const dialogElementRef = useRef( null );

	// Sync DOM state with context state
	useEffect( () => {
		if ( dialogElementRef.current ) {
			if ( isOpen && ! dialogElementRef.current.open ) {
				dialogElementRef.current.showModal();
			} else if ( ! isOpen && dialogElementRef.current.open ) {
				dialogElementRef.current.close();
			}
		}
	}, [ isOpen ] );

	/**
	 * Helper functions:
	 */
	const openDialog = () => {
		if ( dialogRootClientId ) {
			updateBlockAttributes( dialogRootClientId, { editorIsOpen: true } );
		}
	};
	const closeDialog = () => {
		if ( dialogRootClientId ) {
			updateBlockAttributes( dialogRootClientId, {
				editorIsOpen: false,
			} );
			selectBlock( dialogRootClientId );
		}
	};
	const onEscHandler = ( e ) => {
		e.preventDefault();
		closeDialog();
	};

	const blockProps = useBlockProps( {
		ref: dialogElementRef,
		className: clsx( className, {
			'is-size-small': 'small' === dialogSize,
			'is-size-medium': 'medium' === dialogSize,
			'is-size-large': 'large' === dialogSize,
			[ `is-animation-${ animation }` ]: animation,
		} ),
		role: 'dialog',
		'aria-modal': 'true',
		'aria-labelledby': '',
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'wp-block-dialog-element__inner',
		},
		{
			templateLock: false,
			__experimentalCaptureToolbars: true,
		}
	);

	return (
		<KeyboardShortcuts
			bindGlobal
			shortcuts={ {
				esc: onEscHandler,
			} }
		>
			<dialog { ...blockProps }>
				<StyleEngine attributes={ attributes } clientId={ clientId } />
				<InspectorPanel
					openDialog={ openDialog }
					closeDialog={ closeDialog }
					clientId={ clientId }
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
				<Toolbar
					openDialog={ openDialog }
					closeDialog={ closeDialog }
					isOpen={ isOpen }
					clientId={ clientId }
					attributes={ attributes }
				/>
				<button
					className="wp-block-dialog-element__close-button"
					type="button"
					aria-label="Close dialog"
					onClick={ () => closeDialog() }
				>
					<Icon icon={ cancelCircleFilled } />
				</button>
				<div { ...innerBlocksProps } />
			</dialog>
		</KeyboardShortcuts>
	);
}

export default Edit;

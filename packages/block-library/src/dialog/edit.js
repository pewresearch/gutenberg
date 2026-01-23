/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useRef, useMemo } from '@wordpress/element';
import {
	BlockControls,
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	store as blockEditorStore,
	BlockContextProvider,
} from '@wordpress/block-editor';
import {
	Button,
	ToolbarButton,
	ToolbarGroup,
	PanelBody,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';

const TEMPLATE = [
	[
		'core/dialog-trigger',
		{
			lock: {
				move: true,
				remove: false,
			},
		},
		[
			[
				'core/paragraph',
				{
					placeholder: __(
						'Start typing to add Dialog trigger text…'
					),
				},
			],
		],
	],
	[
		'core/dialog-backdrop',
		{
			lock: {
				move: true,
				remove: true,
			},
		},
		[
			[
				'core/dialog-element',
				{
					lock: {
						move: true,
						remove: true,
					},
				},
				[
					[
						'core/heading',
						{
							level: 2,
							placeholder: __( 'Add a dialog label…' ),
							metadata: {
								bindings: {
									content: {
										source: 'core/dialog-element-label',
									},
								},
							},
						},
					],
				],
			],
		],
	],
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { editorIsOpen = false } = attributes;

	// Get the dialog-element block clientId from inner blocks (nested inside dialog-backdrop).
	const dialogElementClientId = useSelect(
		( select ) => {
			const { getBlock } = select( blockEditorStore );
			const block = getBlock( clientId );

			// Find dialog-backdrop first, then find dialog-element inside it
			const dialogBackdropBlock = block?.innerBlocks?.find(
				( innerBlock ) => innerBlock.name === 'core/dialog-backdrop'
			);
			const dialogElementBlock = dialogBackdropBlock?.innerBlocks?.find(
				( innerBlock ) => innerBlock.name === 'core/dialog-element'
			);
			return dialogElementBlock?.clientId;
		},
		[ clientId ]
	);

	const dialogId = useMemo( () => {
		return `block-${ dialogElementClientId }`;
	}, [ dialogElementClientId ] );

	const toggleDialog = () =>
		setAttributes( { editorIsOpen: ! editorIsOpen } );

	// Set up a ref for the block container
	const ref = useRef( null );

	const blockProps = useBlockProps( {
		ref,
	} );

	// We're locking down the template and allowed blocks to only allow the dialog trigger and dialog element.
	const innerBlocksProps = useInnerBlocksProps(
		{},
		{
			template: TEMPLATE,
			templateLock: 'insert',
		}
	);

	const buttonLabel = useMemo(
		() => ( editorIsOpen ? __( 'Close Dialog' ) : __( 'Edit Dialog' ) ),
		[ editorIsOpen ]
	);

	return (
		<>
			<BlockControls __experimentalShareWithChildBlocks>
				<ToolbarGroup>
					<ToolbarButton
						label={ buttonLabel }
						onClick={ toggleDialog }
					>
						{ buttonLabel }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Dialog Settings' ) }>
					<div>
						<p>
							{ __(
								'The dialog element requires a dialog trigger and a dialog element. You can edit the text of the trigger and the content of the dialog by clicking the "Edit Dialog" button above.'
							) }
						</p>
						<Button
							__next40pxDefaultSize
							variant="tertiary"
							onClick={ toggleDialog }
						>
							{ editorIsOpen
								? __( 'Close Dialog' )
								: __( 'Edit Dialog' ) }
						</Button>
					</div>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<BlockContextProvider
					value={ { 'core/dialog-id': dialogId || null } }
				>
					{ innerBlocksProps.children }
				</BlockContextProvider>
			</div>
		</>
	);
}

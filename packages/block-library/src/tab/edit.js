/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
	InspectorControls,
} from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { useMemo, useRef } from '@wordpress/element';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';

const TEMPLATE = [
	[
		'core/paragraph',
		{
			placeholder: __( 'Type / to add a block to tab' ),
		},
	],
];

export default function Edit( {
	attributes,
	clientId,
	isSelected,
	setAttributes,
} ) {
	const { anchor, label, slug, isActive } = attributes;
	const { selectBlock, updateBlockAttributes } =
		useDispatch( blockEditorStore );

	const {
		blockIndex,
		hasChildBlocks,
		hasInnerBlocksSelected,
		tabsHasSelectedBlock,
		tabsClientId,
		tabsAttributes,
		forceDisplay,
		isTabsClientSelected,
		previousTabClientId,
		nextTabClientId,
		isDefaultTab,
	} = useSelect(
		( select ) => {
			const {
				getBlockRootClientId,
				getBlockIndex,
				getBlockOrder,
				getPreviousBlockClientId,
				getNextBlockClientId,
				isBlockSelected,
				hasSelectedInnerBlock,
				getBlockAttributes,
			} = select( blockEditorStore );

			// Get data from core/tabs.
			const rootClientId = getBlockRootClientId( clientId );
			const hasTabSelected = hasSelectedInnerBlock( rootClientId, true );
			const rootAttributes = getBlockAttributes( rootClientId );
			const { activeTabIndex } = rootAttributes;
			const _isTabsClientSelected = isBlockSelected( rootClientId );

			// Get data about this instance of core/tab.
			const _blockIndex = getBlockIndex( clientId );
			const _isDefaultTab = activeTabIndex === _blockIndex;
			const _hasChildBlocks = getBlockOrder( clientId ).length > 0;
			const _hasInnerBlocksSelected = hasSelectedInnerBlock(
				clientId,
				true
			);

			// Get data about the previous and next tabs.
			const _previousTabClientId = getPreviousBlockClientId( clientId );
			const _nextTabClientId = getNextBlockClientId( clientId );

			return {
				blockIndex: _blockIndex,
				hasChildBlocks: _hasChildBlocks,
				hasInnerBlocksSelected: _hasInnerBlocksSelected,
				tabsClientId: rootClientId,
				forceDisplay: _isDefaultTab && _isTabsClientSelected,
				tabsHasSelectedBlock: hasTabSelected,
				isTabsClientSelected: _isTabsClientSelected,
				previousTabClientId: _previousTabClientId,
				nextTabClientId: _nextTabClientId,
				isDefaultTab: _isDefaultTab,
				tabsAttributes: rootAttributes,
			};
		},
		[ clientId ]
	);

	/**
	 * This hook determines if the current tab is selected. This is true if it is the active tab, or if it is selected directly.
	 */
	const isSelectedTab = useMemo( () => {
		if ( isActive ) {
			return true;
		}
		// if ( isSelected || hasInnerBlocksSelected || forceDisplay ) {
		// 	return true;
		// }
		// if (
		// 	isDefaultTab &&
		// 	! isTabsClientSelected &&
		// 	! isSelected &&
		// 	! tabsHasSelectedBlock
		// ) {
		// 	return true;
		// }
		return false;
	}, [
		isActive,
		isSelected,
		hasInnerBlocksSelected,
		forceDisplay,
		isDefaultTab,
		isTabsClientSelected,
		tabsHasSelectedBlock,
	] );
	const innerBlocksRef = useRef( null );

	// Use a custom anchor, if set. Otherwise fall back to the slug generated from the label text.
	const tabPanelId = useMemo( () => anchor || slug, [ anchor, slug ] );
	const tabLabelId = useMemo( () => `${ tabPanelId }--tab`, [ tabPanelId ] );

	const blockProps = useBlockProps( {
		hidden: ! isSelectedTab,
		'aria-labelledby': tabLabelId,
		id: tabPanelId,
		role: 'tabpanel',
		ref: innerBlocksRef,
		tabIndex: 0,
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title="Tab Settings">
					<TextControl
						label="Label"
						value={ label }
						onChange={ ( value ) =>
							setAttributes( { label: value } )
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label="Is Default"
						checked={ isDefaultTab }
						onChange={ ( value ) => {
							updateBlockAttributes( tabsClientId, {
								activeTabIndex: value ? blockIndex : 0,
							} );
						} }
						help={ __(
							'If true, this tab will be selected when the page loads.'
						) }
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<section { ...innerBlocksProps } />
		</>
	);
}

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
	RichText,
	__experimentalUseColorProps as useColorProps,
} from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { useMemo, useRef } from '@wordpress/element';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { cleanForSlug } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { TabFill, TabsListSlot } from './slotfill';

const TEMPLATE = [
	[
		'core/paragraph',
		{
			placeholder: __( 'Type / to add a block to tab' ),
		},
	],
];

/**
 * Generates a slug from a tab's text label.
 *
 * @param {string} label    Tab label RichText value.
 * @param {number} tabIndex Tab index value.
 *
 * @return {string} The generated slug with HTML stripped out.
 */
function slugFromLabel( label, tabIndex ) {
	// Get just the text content, filtering out any HTML tags from the RichText value.
	const htmlDocument = new window.DOMParser().parseFromString(
		label,
		'text/html'
	);
	if ( htmlDocument.body?.textContent ) {
		return cleanForSlug( htmlDocument.body.textContent );
	}

	// Fall back to using the tab index if the label is empty.
	return `tab-panel-${ tabIndex }`;
}

export default function Edit( {
	attributes,
	clientId,
	isSelected,
	setAttributes,
} ) {
	const { anchor, label, slug } = attributes;
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
		if ( isSelected || hasInnerBlocksSelected || forceDisplay ) {
			return true;
		}
		if (
			isDefaultTab &&
			! isTabsClientSelected &&
			! isSelected &&
			! tabsHasSelectedBlock
		) {
			return true;
		}
		return false;
	}, [
		isSelected,
		hasInnerBlocksSelected,
		forceDisplay,
		isDefaultTab,
		isTabsClientSelected,
		tabsHasSelectedBlock,
	] );

	// Use a custom anchor, if set. Otherwise fall back to the slug generated from the label text.
	const tabPanelId = useMemo( () => anchor || slug, [ anchor, slug ] );
	const tabLabelId = useMemo( () => `${ tabPanelId }--tab`, [ tabPanelId ] );

	const colorProps = useColorProps( tabsAttributes );

	const blockProps = useBlockProps( {
		hidden: ! isSelectedTab,
	} );

	const innerBlocksRef = useRef( null );

	const innerBlocksProps = useInnerBlocksProps(
		{
			'aria-labelledby': tabLabelId,
			id: tabPanelId,
			role: 'tabpanel',
			ref: innerBlocksRef,
			tabIndex: 0,
		},
		{
			template: TEMPLATE,
		}
	);

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

			<div { ...blockProps }>
				<TabFill tabsClientId={ tabsClientId }>
					<li
						role="presentation"
						className={ clsx(
							'tabs__list-item',
							colorProps.className
						) }
						style={ {
							...colorProps.style,
						} }
						tabIndex={ isSelectedTab ? 0 : -1 }
					>
						<a // eslint-disable-line jsx-a11y/anchor-is-valid -- remove href attribute in editor so inner text can be selected for editing
							aria-controls={ tabPanelId }
							aria-selected={ isSelectedTab }
							className="tabs__tab-label"
							id={ tabLabelId }
							role="tab"
							tabIndex="0"
						>
							<RichText
								tagName="span"
								withoutInteractiveFormatting
								value={ label }
								placeholder={ __( 'Add label…' ) }
								onChange={ ( value ) =>
									setAttributes( {
										label: value,
										slug: slugFromLabel(
											label,
											blockIndex
										),
									} )
								}
							/>
						</a>
					</li>
				</TabFill>

				{ isSelectedTab && (
					<>
						<TabsListSlot tabsClientId={ tabsClientId } />
						<section { ...innerBlocksProps } />
					</>
				) }
			</div>
		</>
	);
}

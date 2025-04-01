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
	getTypographyClassesAndStyles as useTypographyProps,
	__experimentalUseColorProps as useColorProps,
	store as blockEditorStore,
	RichText,
} from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { useMemo, useRef, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { TabFill, TabsListSlot } from './slotfill';
import Controls from './controls';
import slugFromLabel from './slug-from-label';

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
	const { anchor, label, slug } = attributes;
	const { selectBlock } = useDispatch( blockEditorStore );
	const labelRef = useRef();

	// Add useEffect to focus the RichText when no label exists
	useEffect( () => {
		if ( ! label && labelRef.current ) {
			const timeoutId = setTimeout( () => {
				labelRef.current.focus();
			}, 100 ); // A really quick millisecond delay to ensure the ref is and block is selected and active.
			return () => clearTimeout( timeoutId );
		}
	}, [ label ] );

	const {
		blockIndex,
		hasInnerBlocksSelected,
		tabsHasSelectedBlock,
		tabsClientId,
		tabsAttributes,
		forceDisplay,
		isTabsClientSelected,
		isDefaultTab,
	} = useSelect(
		( select ) => {
			const {
				getBlockRootClientId,
				getBlockIndex,
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
			const _hasInnerBlocksSelected = hasSelectedInnerBlock(
				clientId,
				true
			);

			// Get data about the previous and next tabs.
			const _previousTabClientId = getPreviousBlockClientId( clientId );
			const _nextTabClientId = getNextBlockClientId( clientId );

			return {
				blockIndex: _blockIndex,
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
	const innerBlocksRef = useRef( null );

	// Use a custom anchor, if set. Otherwise fall back to the slug generated from the label text.
	const tabPanelId = useMemo( () => anchor || slug, [ anchor, slug ] );
	const tabLabelId = useMemo( () => `${ tabPanelId }--tab`, [ tabPanelId ] );

	const tabItemColorProps = useColorProps( tabsAttributes );
	const tabContentTypographyProps = useTypographyProps( attributes );

	const blockProps = useBlockProps( {
		hidden: ! isSelectedTab,
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{
			'aria-labelledby': tabLabelId,
			id: tabPanelId,
			role: 'tabpanel',
			ref: innerBlocksRef,
			tabIndex: 0,
			className: clsx(
				tabContentTypographyProps.className,
				'tabs__tab-editor-content'
			),
			style: {
				...tabContentTypographyProps.style,
			},
		},
		{
			template: TEMPLATE,
		}
	);

	return (
		<>
			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
				tabsClientId={ tabsClientId }
				blockIndex={ blockIndex }
				isDefaultTab={ isDefaultTab }
			/>
			<div { ...blockProps }>
				<TabFill tabsClientId={ tabsClientId }>
					<li
						role="presentation"
						className={ clsx(
							'tabs__list-item',
							tabItemColorProps.className
						) }
						style={ {
							...tabItemColorProps.style,
						} }
						// tabIndex={ isSelectedTab ? 0 : -1 }
					>
						<a // eslint-disable-line jsx-a11y/anchor-is-valid -- remove href attribute in editor so inner text can be selected for editing
							aria-controls={ tabPanelId }
							aria-selected={ isSelectedTab }
							className="tabs__tab-label"
							id={ tabLabelId }
							role="tab"
							tabIndex="0"
							onClick={ ( event ) => {
								// Because this is not a "real link" and rather a "tab" we need to prevent the default action.
								event.preventDefault();
								selectBlock( clientId );
							} }
							onKeyDown={ ( event ) => {
								if ( event.key === 'Enter' ) {
									selectBlock( clientId );
								}
							} }
						>
							<RichText
								ref={ labelRef }
								tagName="span"
								withoutInteractiveFormatting
								value={ label }
								placeholder={ __( 'Add label…' ) }
								onChange={ ( value ) =>
									setAttributes( {
										label: value,
										anchor: slugFromLabel(
											value,
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

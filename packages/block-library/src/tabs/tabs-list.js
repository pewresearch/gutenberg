/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import {
	store as blockEditorStore,
	RichText,
	InnerBlocks,
	__experimentalUseColorProps as useColorProps,
} from '@wordpress/block-editor';
import { useCallback, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { cleanForSlug } from '@wordpress/url';

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

export default function TabsList( { tabsClientId } ) {
	const { updateBlockAttributes, __unstableMarkNextChangeAsNotPersistent } =
		useDispatch( blockEditorStore );

	const { innerTabBlocks, selectedTabClientId, tabsAttributes } = useSelect(
		( select ) => {
			const {
				getBlocks,
				getSelectedBlockClientId,
				hasSelectedInnerBlock,
				getBlockAttributes,
			} = select( blockEditorStore );
			const innerBlocks = getBlocks( tabsClientId );
			const selectedBlockClientId = getSelectedBlockClientId();
			let selectedTabId = null;

			// Find the first tab that is selected or has selected inner blocks so we can set it as active.
			for ( const block of innerBlocks ) {
				if (
					block.clientId === selectedBlockClientId ||
					hasSelectedInnerBlock( block.clientId, true )
				) {
					selectedTabId = block.clientId;
					break;
				}
			}

			return {
				innerTabBlocks: innerBlocks,
				selectedTabClientId: selectedTabId,
				tabsAttributes: getBlockAttributes( tabsClientId ),
			};
		},
		[ tabsClientId ]
	);

	const setActiveTab = useCallback(
		( activeTabClientId ) => {
			// Set each inner tab's `isActive` attribute.
			innerTabBlocks.forEach( ( block ) => {
				__unstableMarkNextChangeAsNotPersistent();
				updateBlockAttributes( block.clientId, {
					isActive: block.clientId === activeTabClientId,
				} );
			} );
		},
		[
			innerTabBlocks,
			updateBlockAttributes,
			__unstableMarkNextChangeAsNotPersistent,
		]
	);

	// Set the first tab as active when the editor is loaded.
	useEffect( () => {
		if ( innerTabBlocks?.length ) {
			setActiveTab( innerTabBlocks[ 0 ].clientId );
		}
	}, [] );

	// Update active tab when selection or inner blocks change.
	useEffect( () => {
		const hasActiveTab =
			innerTabBlocks &&
			innerTabBlocks.some( ( block ) => block.attributes.isActive );

		if ( selectedTabClientId ) {
			// If an inner tab block is selected, or its inner blocks
			// are selected, it becomes the active tab.
			setActiveTab( selectedTabClientId );
		} else if ( ! hasActiveTab && innerTabBlocks?.length ) {
			// Otherwise, if there's no active tab, default to the first inner tab.
			setActiveTab( innerTabBlocks[ 0 ].clientId );
		}
	}, [ innerTabBlocks, selectedTabClientId, setActiveTab ] );

	const colorProps = useColorProps( tabsAttributes );

	return (
		<ul className="tabs__list" role="tablist">
			{ innerTabBlocks.map( ( block, index ) => {
				const { clientId, attributes } = block;
				const { anchor, isActive, label, slug } = attributes;
				const tabIndexAttr = isActive ? 0 : -1;
				const tabPanelId = anchor || slug;
				const tabLabelId = `${ tabPanelId }--tab`;

				return (
					<li
						key={ clientId }
						role="presentation"
						className={ clsx(
							'tabs__list-item',
							colorProps.className
						) }
						style={ {
							...colorProps.style,
						} }
						tabIndex={ tabIndexAttr }
					>
						<a // eslint-disable-line jsx-a11y/anchor-is-valid -- remove href attribute in editor so inner text can be selected for editing
							aria-controls={ tabPanelId }
							aria-selected={ isActive }
							className="tabs__tab-label"
							id={ tabLabelId }
							onClick={ () => setActiveTab( clientId ) }
							onFocus={ () => setActiveTab( clientId ) }
							onKeyDown={ ( event ) => {
								if ( event.key === 'Enter' ) {
									setActiveTab( clientId );
								}
							} }
							role="tab"
							tabIndex={ tabIndexAttr }
						>
							<RichText
								tagName="span"
								onChange={ ( value ) =>
									updateBlockAttributes( block.clientId, {
										label: value,
										slug: slugFromLabel( value, index ),
									} )
								}
								placeholder={ __( 'Add tab label…' ) }
								value={ label }
								withoutInteractiveFormatting
							/>
						</a>
					</li>
				);
			} ) }
			<li className="tabs__tab-item__inserter">
				<InnerBlocks.ButtonBlockAppender />
			</li>
		</ul>
	);
}

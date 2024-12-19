/**
 * WordPress dependencies
 */
import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
	RichText,
	withColors,
	InspectorControls,
	__experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
	__experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
} from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { Fragment, useCallback, useEffect, useMemo } from '@wordpress/element';
import { ToggleControl, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
// import './editor.scss';

const TABS_TEMPLATE = [
	[ 'core/tab', { label: 'Tab 1' } ],
	[ 'core/tab', { label: 'Tab 2' } ],
];

function Edit( {
	clientId,
	attributes,
	setAttributes,
	tabBackgroundColor,
	setTabBackgroundColor,
	tabHoverColor,
	setTabHoverColor,
	tabActiveColor,
	setTabActiveColor,
	tabTextColor,
	setTabTextColor,
	tabActiveTextColor,
	setTabActiveTextColor,
	tabHoverTextColor,
	setTabHoverTextColor,
} ) {
	const {
		customTabBackgroundColor,
		customTabHoverColor,
		customTabActiveColor,
		customTabTextColor,
		customTabActiveTextColor,
		customTabHoverTextColor,
		style,
		orientation,
	} = attributes;

	const { innerTabBlocks, selectedTabClientId } = useSelect(
		( select ) => {
			const {
				getBlocks,
				getSelectedBlockClientId,
				hasSelectedInnerBlock,
			} = select( blockEditorStore );
			const innerBlocks = getBlocks( clientId );
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
			};
		},
		[ clientId ]
	);

	const { __unstableMarkNextChangeAsNotPersistent, updateBlockAttributes } =
		useDispatch( blockEditorStore );

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
	}, [ innerTabBlocks, setActiveTab ] );

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

	// Provide additional non-core color supports for tab background and text colors.
	/**
	 * Get the current block's color settings.
	 */
	const colorSettings = useMultipleOriginColorsAndGradients();
	// @TODO: Talk to Gutenberg team about how to add these into the style engine proper.
	const additionalColorSupportingStyles = useMemo( () => {
		const styles = {};
		if ( customTabBackgroundColor ) {
			if ( customTabBackgroundColor.slug ) {
				styles[
					'--custom-tab-background-color'
				] = `var( --wp--preset--color--${ customTabBackgroundColor.slug } );`;
			} else {
				styles[ '--custom-tab-background-color' ] =
					customTabBackgroundColor;
			}
		}
		if ( customTabActiveColor ) {
			if ( customTabActiveColor.slug ) {
				styles[
					'--custom-tab-active-color'
				] = `var( --wp--preset--color--${ customTabActiveColor.slug } );`;
			} else {
				styles[ '--custom-tab-active-color' ] = customTabActiveColor;
			}
		}

		if ( customTabHoverColor ) {
			if ( customTabHoverColor.slug ) {
				styles[
					'--custom-tab-hover-color'
				] = `var( --wp--preset--color--${ customTabHoverColor.slug } );`;
			} else {
				styles[ '--custom-tab-hover-color' ] = customTabHoverColor;
			}
		}

		if ( customTabTextColor ) {
			if ( customTabTextColor.slug ) {
				styles[
					'--custom-tab-text-color'
				] = `var( --wp--preset--color--${ customTabTextColor.slug } );`;
			} else {
				styles[ '--custom-tab-text-color' ] = customTabTextColor;
			}
		}

		if ( customTabActiveTextColor ) {
			if ( customTabActiveTextColor.slug ) {
				styles[
					'--custom-tab-active-text-color'
				] = `var( --wp--preset--color--${ customTabActiveTextColor.slug } );`;
			} else {
				styles[ '--custom-tab-active-text-color' ] =
					customTabActiveTextColor;
			}
		}

		if ( customTabHoverTextColor ) {
			if ( customTabHoverTextColor.slug ) {
				styles[
					'--custom-tab-hover-text-color'
				] = `var( --wp--preset--color--${ customTabHoverTextColor.slug } );`;
			} else {
				styles[ '--custom-tab-hover-text-color' ] =
					customTabHoverTextColor;
			}
		}

		return styles;
	}, [
		customTabBackgroundColor,
		customTabHoverColor,
		customTabActiveColor,
		customTabTextColor,
		customTabActiveTextColor,
		customTabHoverTextColor,
	] );

	const blockProps = useBlockProps( {
		className:
			'vertical' === orientation
				? 'is-orientation-vertical'
				: 'is-orientation-horizontal',
		style: {
			...style,
			...additionalColorSupportingStyles,
		},
	} );

	const innerBlockProps = useInnerBlocksProps(
		{
			className: 'tabs__content',
		},
		{
			__experimentalCaptureToolbars: true,
			clientId,
			orientation,
			template: TABS_TEMPLATE,
		}
	);

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={ __( 'Tabs Settings' ) }>
					<ToggleControl
						__nextHasNoMarginBottom
						label="Vertical Tabs"
						checked={ 'vertical' === orientation }
						onChange={ () =>
							setAttributes( {
								orientation:
									'vertical' === orientation
										? 'horizontal'
										: 'vertical',
							} )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="color">
				<ColorGradientSettingsDropdown
					settings={ [
						{
							label: __( 'Tab Background' ),
							colorValue:
								tabBackgroundColor?.color ??
								customTabBackgroundColor,
							onColorChange: ( value ) => {
								setTabBackgroundColor( value );
								setAttributes( {
									customTabBackgroundColor: value,
								} );
							},
						},
						{
							label: __( 'Tab Hover State' ),
							colorValue:
								tabHoverColor?.color ?? customTabHoverColor,
							onColorChange: ( value ) => {
								setTabHoverColor( value );
								setAttributes( {
									customTabHoverColor: value,
								} );
							},
						},
						{
							label: __( 'Tab Active State' ),
							colorValue:
								tabActiveColor?.color ?? customTabActiveColor,
							onColorChange: ( value ) => {
								setTabActiveColor( value );
								setAttributes( {
									customTabActiveColor: value,
								} );
							},
						},
						{
							label: __( 'Tab Text' ),
							colorValue:
								tabTextColor?.color ?? customTabTextColor,
							onColorChange: ( value ) => {
								setTabTextColor( value );
								setAttributes( {
									customTabTextColor: value,
								} );
							},
						},
						{
							label: __( 'Tab Hover Text' ),
							colorValue:
								tabHoverTextColor?.color ??
								customTabHoverTextColor,
							onColorChange: ( value ) => {
								setTabHoverTextColor( value );
								setAttributes( {
									customTabHoverTextColor: value,
								} );
							},
						},
						{
							label: __( 'Tab Active Text' ),
							colorValue:
								tabActiveTextColor?.color ??
								customTabActiveTextColor,
							onColorChange: ( value ) => {
								setTabActiveTextColor( value );
								setAttributes( {
									customTabActiveTextColor: value,
								} );
							},
						},
					] }
					panelId={ clientId }
					disableCustomColors={ false }
					__experimentalIsRenderedInSidebar
					{ ...colorSettings }
				/>
			</InspectorControls>
			<div { ...blockProps }>
				<ul className="tabs__list" role="tablist">
					{ innerTabBlocks.map( ( block ) => {
						const { anchor, isActive, label, slug } =
							block.attributes;
						const tabIndexAttr = isActive ? 0 : -1;
						const tabPanelId = anchor || slug;
						const tabLabelId = `${ tabPanelId }--tab`;

						return (
							<li
								key={ block.clientId }
								className="tabs__list-item"
								role="presentation"
							>
								<a // eslint-disable-line jsx-a11y/anchor-is-valid -- remove href attribute in editor so inner text can be selected for editing
									aria-controls={ tabPanelId }
									aria-selected={ isActive }
									className="tabs__tab-label"
									id={ tabLabelId }
									onClick={ () =>
										setActiveTab( block.clientId )
									}
									onFocus={ () =>
										setActiveTab( block.clientId )
									}
									onKeyDown={ ( event ) => {
										if ( event.key === 'Enter' ) {
											setActiveTab( block.clientId );
										}
									} }
									role="tab"
									tabIndex={ tabIndexAttr }
								>
									<RichText
										tagName="span"
										onChange={ ( value ) =>
											updateBlockAttributes(
												block.clientId,
												{
													label: value,
												}
											)
										}
										placeholder={ __( 'Add label…' ) }
										value={ label }
										withoutInteractiveFormatting
									/>
								</a>
							</li>
						);
					} ) }
				</ul>

				<div { ...innerBlockProps }></div>
			</div>
		</Fragment>
	);
}

export default withColors(
	'tabBackgroundColor',
	'tabHoverColor',
	'tabActiveColor',
	'tabTextColor',
	'tabActiveTextColor',
	'tabHoverTextColor'
)( Edit );

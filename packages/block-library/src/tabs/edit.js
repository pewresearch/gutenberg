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
	withColors,
	InnerBlocks,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import Controls from './controls';
import useColorSupports from './use-color-supports';
import { TabFill } from '../tab/slotfill';

const TABS_TEMPLATE = [
	[ 'core/tab', { label: 'Tab 1', slug: 'tab-1' } ],
	[ 'core/tab', { label: 'Tab 2', slug: 'tab-2' } ],
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
	const { style, orientation } = attributes;

	/**
	 * Provide additional non-core color supports for tab background and text colors.
	 * TODO: Talk to Gutenberg team about how to add these into the style engine proper so that these can be set in the style book??
	 */
	const additionalColorSupportingStyles = useColorSupports( attributes );

	/**
	 * Block props for the tabs container.
	 */
	const blockProps = useBlockProps( {
		className: clsx(
			'vertical' === orientation ? 'is-vertical' : 'is-horizontal'
		),
		style: {
			...style,
			...additionalColorSupportingStyles,
		},
	} );

	/**
	 * Innerblocks props for the tabs content.
	 */
	const innerBlockProps = useInnerBlocksProps(
		{
			className: 'tabs__content',
		},
		{
			__experimentalCaptureToolbars: true,
			clientId,
			orientation,
			template: TABS_TEMPLATE,
			renderAppender: false, // We handle this via a slotfill.
		}
	);

	return (
		<>
			<Controls
				{ ...{
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
				} }
			/>
			<div { ...blockProps }>
				{ innerBlockProps.children }
				<TabFill tabsClientId={ clientId }>
					<li className="wp-block-tabs__tab-item__inserter">
						<InnerBlocks.ButtonBlockAppender />
					</li>
				</TabFill>
			</div>
		</>
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

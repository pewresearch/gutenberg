/**
 * WordPress dependencies
 */
import {
	store,
	getContext,
	getElement,
	withSyncEvent,
} from '@wordpress/interactivity';

/**
 * Determines whether a value is numeric.
 *
 * @param {*} value A vlue to check.
 * @return {boolean} Whether the value is numeric.
 */
function isNumeric( value ) {
	return ! isNaN( parseFloat( value ) );
}

// Interactivy store for the tabs block.
const { state, actions } = store( 'core/tabs', {
	state: {
		/**
		 * Whether the tab is the active tab.
		 *
		 * @type {boolean}
		 */
		get isActiveTab() {
			const context = getContext();
			const { attributes } = getElement();
			const tabIndexValue = attributes?.[ 'data-tab-index' ];
			const tabIndex = isNumeric( tabIndexValue )
				? parseInt( tabIndexValue, 10 )
				: 0;
			return context.activeTabIndex === tabIndex;
		},
		/**
		 * The value of the tabindex attribute for the tab label.
		 *
		 * @type {false|string}
		 */
		get tabindexLabelAttribute() {
			return state.isActiveTab ? false : '-1';
		},
		/**
		 * The value of the tabindex attribute for the tab panel.
		 *
		 * @type {false|string}
		 */
		get tabindexPanelAttribute() {
			return state.isActiveTab ? -1 : 0;
		},
	},
	actions: {
		/**
		 * Handles the keydown event for the tab label.
		 *
		 * @param {KeyboardEvent} event The keydown event.
		 */

		handleTabKeyDown: withSyncEvent( ( event ) => {
			const { key, target } = event;

			if ( ! target ) {
				return;
			}

			const { ref } = getElement();
			const container = ref?.closest( '.wp-block-tabs' );
			const tabs = Array.from(
				container?.querySelectorAll( '.wp-block-tabs__tab-label' ) || []
			);

			const currentIndex = tabs.indexOf( target );
			let nextIndex = currentIndex;

			switch ( key ) {
				case 'ArrowRight':
					event.stopPropagation();
					event.preventDefault();

					// Loop back to the first tab if the last tab is reached.
					nextIndex = ( currentIndex + 1 ) % tabs.length;
					actions.setActiveTab( nextIndex );
					tabs[ nextIndex ]?.focus();
					break;
				case 'ArrowLeft':
					event.stopPropagation();
					event.preventDefault();

					// Loop back to the last tab if the first tab is reached.
					nextIndex =
						( currentIndex - 1 + tabs.length ) % tabs.length;
					actions.setActiveTab( nextIndex );
					tabs[ nextIndex ]?.focus();
					break;
				default:
					break;
			}
		} ),
		/**
		 * Handles the click event for the tab label.
		 *
		 * @param {MouseEvent} event The click event.
		 */
		handleTabClick: withSyncEvent( ( event ) => {
			event.preventDefault();

			const tabIndexValue =
				event.target?.getAttribute( 'data-tab-index' );
			const tabIndex = isNumeric( tabIndexValue )
				? parseInt( tabIndexValue, 10 )
				: null;

			if ( tabIndex !== null ) {
				actions.setActiveTab( tabIndex );
			}
		} ),
		/**
		 * Sets the active tab index.
		 *
		 * @param {number} tabIndex The index of the active tab.
		 */
		setActiveTab: ( tabIndex ) => {
			const context = getContext();
			context.activeTabIndex = tabIndex;
		},
	},
	callbacks: {
		/**
		 * Focuses the tab from ?activeTabIndex query param.
		 */
		focusActiveTabIndex: () => {
			const context = getContext();
			const { activeTabIndexQueryVar } = context;
			if ( false !== activeTabIndexQueryVar ) {
				const tabLabel = document.querySelector(
					`a.wp-block-tabs__tab-label[data-tab-hash="${ activeTabIndexQueryVar }"]`
				);
				if ( tabLabel ) {
					tabLabel.scrollIntoView( { behavior: 'smooth' } );
				}
			}
		},
	},
} );

/**
 * WordPress dependencies
 */
import {
	store,
	getContext,
	getElement,
	withSyncEvent,
} from '@wordpress/interactivity';

// Interactivy store for the tabs block.
const { state, actions } = store( 'core/tabs', {
	state: {
		get tabIndex() {
			const context = getContext();
			const { tabsList, tab } = context;
			const tabId = tab?.id;
			const tabIndex = tabsList.findIndex( ( t ) => t.id === tabId );
			return tabIndex;
		},
		/**
		 * Whether the tab is the active tab.
		 *
		 * @type {boolean}
		 */
		get isActiveTab() {
			const context = getContext();
			const { tabsList, tab } = context;
			const tabId = tab?.id;
			const tabIndex = tabsList.findIndex( ( t ) => t.id === tabId );
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

			const tabIndex = state.tabIndex;

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
} );

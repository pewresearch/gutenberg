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
		/**
		 * Gets the index of the active tab element whether it
		 * is a tab label or tab panel.
		 *
		 * @type {number|null}
		 */
		get tabIndex() {
			const { attributes } = getElement();
			// Check if data-wp-tab-id exists in attributes and if so use that as the tab id.
			const tabId = attributes?.[ 'data-wp-tab-id' ] || null;
			if ( ! tabId ) {
				return null;
			}
			const { tabsList } = getContext();
			const tabIndex = tabsList.findIndex( ( t ) => t.id === tabId );
			return tabIndex;
		},
		/**
		 * Whether the tab panel or tab label is the active tab.
		 *
		 * @type {boolean}
		 */
		get isActiveTab() {
			const { activeTabIndex } = getContext();
			const tabIndex = state.tabIndex;
			return activeTabIndex === tabIndex;
		},
		/**
		 * The value of the tabindex attribute.
		 *
		 * @type {false|string}
		 */
		get tabIndexAttribute() {
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
			// If this is the enter key then lets get the tab index from context and set the active tab to that index.
			if ( event.key === 'Enter' ) {
				const tabIndex = state.tabIndex;
				if ( tabIndex !== null ) {
					actions.setActiveTab( tabIndex );
				}
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
	callbacks: {
		/**
		 * When the tabs are initialized, we need to check if there is a hash in the url and if so if it exists in the current tabsList, set the active tab to that index.
		 */
		onTabsInit: () => {
			const { tabsList } = getContext();
			const hash = window.location.hash;
			const tabId = hash.replace( '#', '' );
			const tabIndex = tabsList.findIndex( ( t ) => t.id === tabId );
			if ( tabIndex !== null ) {
				actions.setActiveTab( tabIndex );
			}
		},
	},
} );

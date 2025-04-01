/**
 * WordPress dependencies
 */
import { store, getContext, withSyncEvent } from '@wordpress/interactivity';

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
			return state.isActiveTab ? -1 : 0;
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
} );

/**
 * WordPress dependencies
 */
import { select, createReduxStore } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

const STORE_NAME = 'core/tabs';

const DEFAULT_STATE = {
	activeTabsByParent: {},
};

const actions = {
	setActiveTab( tabsClientId, activeTabClientId ) {
		return {
			type: 'SET_ACTIVE_TAB',
			tabsClientId,
			activeTabClientId,
		};
	},
};

const selectors = {
	getActiveTab( state, tabsClientId ) {
		return state.activeTabsByParent[ tabsClientId ];
	},
};

const reducer = ( state = DEFAULT_STATE, action ) => {
	switch ( action.type ) {
		case 'SET_ACTIVE_TAB':
			return {
				...state,
				activeTabsByParent: {
					...state.activeTabsByParent,
					[ action.tabsClientId ]: action.activeTabClientId,
				},
			};
		default:
			return state;
	}
};

// Initialize store with default active tabs
const initializeStore = ( store ) => {
	const { getBlocks } = select( blockEditorStore );
	const blocks = getBlocks();

	// Find all tabs blocks and set their initial active tab
	const findAndSetInitialTabs = ( blocks ) => {
		blocks.forEach( ( block ) => {
			if ( block.name === 'core/tabs' ) {
				const innerBlocks = block.innerBlocks;
				if ( innerBlocks.length > 0 ) {
					// Set the first tab as active
					store.dispatch(
						actions.setActiveTab(
							block.clientId,
							innerBlocks[ 0 ].clientId
						)
					);
				}
			}
			// Recursively check inner blocks
			if ( block.innerBlocks.length > 0 ) {
				findAndSetInitialTabs( block.innerBlocks );
			}
		} );
	};

	findAndSetInitialTabs( blocks );
};

const store = createReduxStore( STORE_NAME, {
	reducer,
	actions,
	selectors,
} );

// Initialize the store with default values
initializeStore( store );

export default store;

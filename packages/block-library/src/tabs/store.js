/**
 * WordPress dependencies
 */
import { register } from '@wordpress/data';

const STORE_NAME = 'core/tabs';

// This is a custom and simple wordpress/data redux data store for core/tabs.
// All it does it track the last active tab clientId for the given tabs block clientId

const store = register( STORE_NAME, {} );

export default store;

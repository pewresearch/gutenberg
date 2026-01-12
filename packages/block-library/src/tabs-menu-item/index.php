<?php
/**
 * Tabs Menu Item Block
 *
 * @package WordPress
 */

/**
 * Registers the `core/tabs-menu-item` block on the server.
 *
 * Note: This block has no render callback because it serves as a template
 * that is extracted and cloned by the parent tabs-menu block's PHP.
 *
 * @since 6.9.0
 */
function register_block_core_tabs_menu_item() {
	register_block_type_from_metadata( __DIR__ . '/tabs-menu-item' );
}
add_action( 'init', 'register_block_core_tabs_menu_item' );

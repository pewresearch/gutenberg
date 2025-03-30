<?php

/**
 * Get the tab label binding.
 *
 * @param array    $source_args Source arguments.
 * @param WP_Block $block The block.
 * @param string   $attribute_name The attribute name.
 * @return string  The tab binding, either tab/label, or tab/slug Defaults to tab/label and ultimately Tab Title... if nothing is found.
 */
function get_tab_binding( $source_args, $block, $attribute_name ) {
	$context_key = array_key_exists( 'contextKey', $source_args ) ? $source_args['contextKey'] : 'tab/label';
	$parsed_block = $block->parsed_block;
	$context = $block->context;
	return $context[ $context_key ] ?? 'Tab Label...';
}

/**
 * Register the tab block bindings.
 */
function register_block_core_tab_bindings() {
	register_block_bindings_source(
		'core/tab',
		array(
			'label'              => __( 'Tab Info', 'core/tab' ),
			'get_value_callback' => 'get_tab_binding',
			'uses_context'       => array( 'tab/label', 'tab/slug' ),
		)
	);
}
add_action( 'init', 'register_block_core_tab_bindings' );


/**
 * Registers the `core/tab` block on the server.
 */
function register_block_core_tab() {
	register_block_type_from_metadata(
		__DIR__ . '/tab',
	);
}

add_action( 'init', 'register_block_core_tab' );

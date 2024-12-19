<?php

/**
 * Get the tab label binding.
 *
 * @param array    $source_args Source arguments.
 * @param WP_Block $block The block.
 * @param string   $attribute_name The attribute name.
 * @return string  The tab binding, either tab/label, tab/slug, or tab/tabIndex. Defaults to tab/label and ultimately Tab Title... if nothing is found.
 */
function get_tab_binding( $source_args, $block, $attribute_name ) {
	$context_key = array_key_exists( 'contextKey', $source_args ) ? $source_args['contextKey'] : 'tab/label';
	$parsed_block = $block->parsed_block;
	$context = $block->context;
	return $context[ $context_key ] ?? 'Tab Title...';
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
			'uses_context'       => array( 'tab/label', 'tab/index', 'tab/slug' ),
		)
	);
}

add_action( 'init', 'register_block_core_tab_bindings' );


/**
 * Render the block
 *
 * @param array  $attributes Block attributes
 * @param string $content Block content
 * @param array  $block WP_Block object
 * @return string
 */
function render_block_core_tab( $attributes, $content ) {
	// Modify markup to include interactivity API attributes.
	$p = new WP_HTML_Tag_Processor( $content );

	while ( $p->next_tag( array( 'class_name' => 'wp-block-tab' ) ) ) {
		// Add role="tabpanel" to each tab panel.
		$p->set_attribute( 'data-wp-bind--role', 'state.roleAttribute' );

		// Hide all tab panels that are not currently selected.
		$p->set_attribute( 'data-wp-bind--hidden', '!state.isActiveTab' );

		// Add tabindex="0" to the selected tab panel, so it can be focused.
		$p->set_attribute( 'data-wp-bind--tabindex', 'state.tabindexPanelAttribute' );

		// Store the index of each tab panel for tracking the selected tab.
		$p->set_attribute( 'data-tab-index', $attributes['tabIndex'] );
	}

	return $p->get_updated_html();
}

/**
 * Registers the `core/tab` block on the server.
 */
function register_block_core_tab() {
	register_block_type_from_metadata(
		__DIR__ . '/tab',
		array(
			'render_callback' => 'render_block_core_tab',
		)
	);
}

add_action( 'init', 'register_block_core_tab' );


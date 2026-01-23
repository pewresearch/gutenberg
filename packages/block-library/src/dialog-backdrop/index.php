<?php
/**
 * Dialog Backdrop Block
 *
 * @package WordPress
 */

/**
 * Extract background color from block attributes/styles.
 *
 * @param array $attributes Block attributes.
 *
 * @return string|null The background color value or null.
 */
function block_core_dialog_backdrop_get_background_color( array $attributes ): ?string {
	// Check for preset background color.
	if ( ! empty( $attributes['backgroundColor'] ) ) {
		return 'var(--wp--preset--color--' . $attributes['backgroundColor'] . ')';
	}

	// Check for custom background color in style attribute.
	if ( ! empty( $attributes['style']['color']['background'] ) ) {
		return $attributes['style']['color']['background'];
	}

	// Check for gradient.
	if ( ! empty( $attributes['gradient'] ) ) {
		return 'var(--wp--preset--gradient--' . $attributes['gradient'] . ')';
	}

	// Check for custom gradient.
	if ( ! empty( $attributes['style']['color']['gradient'] ) ) {
		return $attributes['style']['color']['gradient'];
	}

	return null;
}

/**
 * Render the 'core/dialog-backdrop' block.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content.
 * @param WP_Block $block      Block instance.
 *
 * @return string Rendered block HTML.
 */
function render_block_core_dialog_backdrop( array $attributes, string $content, WP_Block $block ): string {
	if ( empty( $content ) ) {
		return '';
	}

	$context_id = isset( $block->context['core/dialog-id'] ) ? $block->context['core/dialog-id'] : null;
	if ( ! $context_id ) {
		return '';
	}

	$suffix = wp_scripts_get_suffix();
	if ( defined( 'IS_GUTENBERG_PLUGIN' ) && IS_GUTENBERG_PLUGIN ) {
		$module_url = gutenberg_url( '/build-module/block-library/dialog-backdrop/view.min.js' );
	}

	wp_register_script_module(
		'@wordpress/block-library/dialog-backdrop',
		isset( $module_url ) ? $module_url : includes_url( "blocks/dialog-backdrop/view{$suffix}.js" ),
		array( '@wordpress/interactivity' ),
		defined( 'GUTENBERG_VERSION' ) ? GUTENBERG_VERSION : get_bloginfo( 'version' )
	);

	wp_enqueue_script_module( '@wordpress/block-library/dialog-backdrop' );

	// Extract background color and set as CSS variable for dialog-element's ::backdrop.
	$background_color = block_core_dialog_backdrop_get_background_color( $attributes );
	$style            = '';
	if ( $background_color ) {
		$style = '--wp--style--dialog-backdrop-color: ' . $background_color . ';';
	}

	$wrapper_attributes = array(
		'data-wp-interactive'           => 'core/dialog/private',
		'data-wp-on--click'             => 'callbacks.onBackdropWrapperClick',
		'data-wp-class--is-dialog-open' => 'state.isOpen',
	);

	if ( $style ) {
		$wrapper_attributes['style'] = $style;
	}

	$block_wrapper_attrs = get_block_wrapper_attributes( $wrapper_attributes );

	return wp_sprintf(
		'<div %1$s>%2$s</div>',
		$block_wrapper_attrs,
		$content
	);
}

/**
 * Registers the `core/dialog-backdrop` block on server.
 *
 * @hook init
 * @return void
 */
function register_block_core_dialog_backdrop() {
	register_block_type_from_metadata(
		__DIR__ . '/dialog-backdrop',
		array(
			'render_callback' => 'render_block_core_dialog_backdrop',
		)
	);
}
add_action( 'init', 'register_block_core_dialog_backdrop' );

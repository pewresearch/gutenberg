<?php
/**
 * Server-side rendering of the `core/post-toplines` block.
 *
 * @package WordPress
 */

/**
 * Renders the `core/post-toplines` block on the server.
 *
 * @since 6.3.0
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block default content.
 * @param WP_Block $block      Block instance.
 *
 * @return string Returns the HTML representing the toplines.
 */
function render_block_core_post_toplines( $attributes, $content, $block ) {
	if ( empty( $block->context['postId'] ) ) {
		return '';
	}

	if ( post_password_required( $block->context['postId'] ) ) {
		return '';
	}

	$toplines = gutenberg_get_post_toplines( $block->context['postId'] );

	if ( empty( $toplines ) ) {
		return '';
	}

	$wrapper_attributes = get_block_wrapper_attributes();
	$list_items         = '';

	foreach ( $toplines as $topline ) {
		$list_items .= '<li class="wp-block-post-toplines__item">' . wp_kses_post( $topline ) . '</li>';
	}

	return sprintf(
		'<ul %1$s>%2$s</ul>',
		$wrapper_attributes,
		$list_items
	);
}

/**
 * Registers the `core/post-toplines` block on the server.
 *
 * @since 6.3.0
 */
function register_block_core_post_toplines() {
	register_block_type_from_metadata(
		__DIR__ . '/post-toplines',
		array(
			'render_callback' => 'render_block_core_post_toplines',
		)
	);
}
add_action( 'init', 'register_block_core_post_toplines' );

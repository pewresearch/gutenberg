<?php
/**
 * Returns typography classnames depending on whether there are named font sizes/families.
 *
 * @since 6.1.0
 *
 * @param array $attributes The block attributes.
 * @return string The typography color classnames to be applied to the block elements.
 */
function block_core_tab_get_typography_classes( $attributes ) {
	$typography_classes    = array();
	$has_named_font_family = ! empty( $attributes['fontFamily'] );
	$has_named_font_size   = ! empty( $attributes['fontSize'] );

	if ( $has_named_font_size ) {
		$typography_classes[] = sprintf( 'has-%s-font-size', esc_attr( $attributes['fontSize'] ) );
	}

	if ( $has_named_font_family ) {
		$typography_classes[] = sprintf( 'has-%s-font-family', esc_attr( $attributes['fontFamily'] ) );
	}

	return implode( ' ', $typography_classes );
}

/**
 * Returns typography styles to be included in an HTML style tag.
 * This excludes text-decoration, which is applied only to the label and button elements of the search block.
 *
 * @since 6.1.0
 *
 * @param array $attributes The block attributes.
 * @return string A string of typography CSS declarations.
 */
function block_core_tab_get_typography_styles( $attributes ) {
	$typography_styles = array();

	// Add typography styles.
	if ( ! empty( $attributes['style']['typography']['fontSize'] ) ) {
		$typography_styles[] = sprintf(
			'font-size: %s;',
			wp_get_typography_font_size_value(
				array(
					'size' => $attributes['style']['typography']['fontSize'],
				)
			)
		);
	}

	if ( ! empty( $attributes['style']['typography']['fontFamily'] ) ) {
		$typography_styles[] = sprintf( 'font-family: %s;', $attributes['style']['typography']['fontFamily'] );
	}

	if ( ! empty( $attributes['style']['typography']['letterSpacing'] ) ) {
		$typography_styles[] = sprintf( 'letter-spacing: %s;', $attributes['style']['typography']['letterSpacing'] );
	}

	if ( ! empty( $attributes['style']['typography']['fontWeight'] ) ) {
		$typography_styles[] = sprintf( 'font-weight: %s;', $attributes['style']['typography']['fontWeight'] );
	}

	if ( ! empty( $attributes['style']['typography']['fontStyle'] ) ) {
		$typography_styles[] = sprintf( 'font-style: %s;', $attributes['style']['typography']['fontStyle'] );
	}

	if ( ! empty( $attributes['style']['typography']['lineHeight'] ) ) {
		$typography_styles[] = sprintf( 'line-height: %s;', $attributes['style']['typography']['lineHeight'] );
	}

	if ( ! empty( $attributes['style']['typography']['textTransform'] ) ) {
		$typography_styles[] = sprintf( 'text-transform: %s;', $attributes['style']['typography']['textTransform'] );
	}

	return implode( '', $typography_styles );
}

/**
 * Render the core/tab block.
 * This function adds Interactivity API directives to the tabpanel.
 *
 * @since 6.1.0
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content.
 * @param WP_Block $block      WP_Block object.
 * @return string
 */
function render_block_core_tab( $attributes, $content, $block ) {
	$tag_processor = new WP_HTML_Tag_Processor( $content );
	$tag_processor->next_tag( array( 'class_name' => 'wp-block-tab' ) );

	$tab_id = $tag_processor->get_attribute( 'id' );

	$tag_processor->set_attribute( 'role', 'tabpanel' );
	$tag_processor->set_attribute( 'aria-labelledby', $tab_id );
	$tag_processor->set_attribute( 'data-wp-tab-id', $tab_id );
	$tag_processor->set_attribute( 'data-wp-bind--hidden', '!state.isActiveTab' );
	$tag_processor->set_attribute( 'data-wp-bind--tabindex', 'state.tabIndexAttribute' );

	$style = $tag_processor->get_attribute( 'style' );
	$style .= block_core_tab_get_typography_styles( $attributes );
	$style .= block_core_tab_get_typography_classes( $attributes );
	$tag_processor->set_attribute( 'style', $style );

	$content = $tag_processor->get_updated_html();

	return $content;
}

/**
 * Registers the `core/tab` block on the server.
 *
 * @since 6.1.0
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

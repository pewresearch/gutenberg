<?php
/**
 * Tabs Menu Block
 *
 * @package WordPress
 */

/**
 * Render callback for core/tabs-menu.
 *
 * @param array     $attributes Block attributes.
 * @param string    $content    Block content (contains the tabs-menu-item template).
 * @param \WP_Block $block      WP_Block instance.
 *
 * @return string Updated HTML.
 */
function block_core_tabs_menu_render_callback( array $attributes, string $content, \WP_Block $block ): string {
	$tabs_list = $block->context['core/tabs-list'] ?? array();

	if ( empty( $tabs_list ) ) {
		return '';
	}

	// Extract the tabs-menu-item template element from inner blocks content.
	// The tabs-menu-item saves as an <a> element with wp-block-tabs-menu-item class.
	preg_match(
		'/<a[^>]*class="[^"]*wp-block-tabs-menu-item[^"]*"[^>]*>/i',
		$content,
		$template_matches
	);
	$template = $template_matches[0] ?? '<a class="wp-block-tabs-menu-item tabs__tab-label">';

	// Remove the template marker class and hidden attribute from the extracted template
	$template = preg_replace( '/\s*tabs__tab-template/', '', $template );
	$template = preg_replace( '/\s*hidden(?:="[^"]*")?/', '', $template );

	// Build tabs from template
	$tabs_markup = '';
	foreach ( $tabs_list as $tab ) {
		$tab_id    = esc_attr( $tab['id'] ?? '' );
		$tab_label = esc_html( $tab['label'] ?? '' );

		if ( empty( $tab_id ) ) {
			continue;
		}

		// Clone template and inject tab-specific attributes
		$tab_element = $template;

		// Remove closing > to append more attributes
		$tab_element  = preg_replace( '/>$/', '', $tab_element );
		$tab_element .= sprintf(
			' id="tab__%1$s" href="#%1$s" role="tab" aria-controls="%1$s" ' .
			'data-wp-on--click="actions.handleTabClick" ' .
			'data-wp-on--keydown="actions.handleTabKeyDown" ' .
			'data-wp-bind--aria-selected="state.isActiveTab" ' .
			'data-wp-bind--tabindex="state.tabIndexAttribute">%2$s</a>',
			$tab_id,
			html_entity_decode( $tab_label )
		);
		$tabs_markup .= $tab_element;
	}

	// Process container and replace inner content with actual tabs
	$tag_processor = new WP_HTML_Tag_Processor( $content );
	$tag_processor->next_tag( array( 'class_name' => 'wp-block-tabs-menu' ) );

	$updated_content = $tag_processor->get_updated_html();

	// Replace the inner tabs-menu-item template with actual tabs
	// The template is the <a> element that was saved as inner block content
	$final_content = preg_replace(
		'/<a[^>]*class="[^"]*wp-block-tabs-menu-item[^"]*"[^>]*>(?:<\/a>)?/i',
		$tabs_markup,
		$updated_content
	);

	return is_string( $final_content ) ? $final_content : $updated_content;
}

/**
 * Registers the `core/tabs-menu` block on the server.
 *
 * @since 6.9.0
 */
function register_block_core_tabs_menu() {
	register_block_type_from_metadata(
		__DIR__ . '/tabs-menu',
		array(
			'render_callback' => 'block_core_tabs_menu_render_callback',
		)
	);
}
add_action( 'init', 'register_block_core_tabs_menu' );

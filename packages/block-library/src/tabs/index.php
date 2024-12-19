<?php
/**
 * Constructs a string of CSS variables for the tabs block.
 * - customTabBackgroundColor - The background color of the tabs.
 * - customTabHoverColor - The hover background color of the tabs.
 * - customTabActiveColor - The active background color of the tabs.
 * - customTabTextColor - The text color of the tabs.
 * - customTabHoverTextColor - The hover text color of the tabs.
 * - customTabActiveTextColor - The active text color of the tabs.
 *
 * @param array $attributes Block attributes.
 * @return string A string of CSS variables.
 */
function block_core_tabs_generate_color_variables( $attributes ) {
	$tab_background = array_key_exists( 'customTabBackgroundColor', $attributes ) ? $attributes['customTabBackgroundColor'] : '';
	$tab_hover      = array_key_exists( 'customTabHoverColor', $attributes ) ? $attributes['customTabHoverColor'] : '';
	$tab_active     = array_key_exists( 'customTabActiveColor', $attributes ) ? $attributes['customTabActiveColor'] : '';
	$tab_text       = array_key_exists( 'customTabTextColor', $attributes ) ? $attributes['customTabTextColor'] : '';
	$hover_text     = array_key_exists( 'customTabHoverTextColor', $attributes ) ? $attributes['customTabHoverTextColor'] : '';
	$active_text    = array_key_exists( 'customTabActiveTextColor', $attributes ) ? $attributes['customTabActiveTextColor'] : '';

	$styles = array(
		'--custom-tab-background-color'  => $tab_background,
		'--custom-tab-hover-color'       => $tab_hover,
		'--custom-tab-active-color'      => $tab_active,
		'--custom-tab-text-color'        => $tab_text,
		'--custom-tab-hover-text-color'  => $hover_text,
		'--custom-tab-active-text-color' => $active_text,
	);

	$style_string = array_map(
		function ( $key, $value ) {
			return ! empty( $value ) ? $key . ': ' . $value . ';' : '';
		},
		array_keys( $styles ),
		$styles
	);
	$style_string = implode( ' ', array_filter( $style_string ) );

	return $style_string;
}

/**
 * Render the block
 *
 * @param array    $attributes Block attributes.
 * @param string   $content Block content.
 * @param WP_Block $block WP_Block object.
 * @return string
 */
function render_block_core_tabs( $attributes, $content, $block ) {
	wp_enqueue_script_module( '@wordpress/block-library/tabs' );

	$styles = block_core_tabs_generate_color_variables( $attributes );

	$wrapper_attributes = get_block_wrapper_attributes(
		array(
			'class'               => 'vertical' === $attributes['orientation'] ? 'is-orientation-vertical' : 'is-orientation-horizontal',
			'data-wp-interactive' => 'core/tabs',
			'data-wp-context'     => wp_json_encode(
				array(
					'activeTabIndex' => 0,
				)
			),
			'style'               => $styles,
		)
	);

	$innerblocks = $block->parsed_block['innerBlocks'];
	$tabs_list   = array_map(
		function ( $tab ) {
			$attrs = $tab['attrs'];
			return $attrs;
		},
		$innerblocks
	);
	$tabs_markup = '<ul class="tabs__list" role="tablist">';
	foreach ( $tabs_list as $tab_index => $tab ) {
		$tab_slug     = $tab['slug'];
		$tab_label    = $tab['label'];
		$tabs_markup .= wp_sprintf( '<li class="tabs__list-item"><a id="%1$s" class="tabs__tab-label" href="%1$s" data-wp-on--click="actions.handleTabClick" data-tab-index="%2$s" data-wp-bind--aria-selected="state.isActiveTab">%3$s</a></li>', $tab_slug, $tab_index, $tab_label );
	}
	$tabs_markup .= '</ul>';

	return wp_sprintf(
		'<div %1$s><h3 class="tabs__title">%2$s</h3>%3$s%4$s</div>',
		$wrapper_attributes,
		'Contents',
		$tabs_markup,
		$content
	);
}

/**
 * Registers the `core/tab` block on the server.
 *
 * @since 6.8.0
 */
function register_block_core_tabs() {
	register_block_type_from_metadata(
		__DIR__ . '/tabs',
		array(
			'render_callback' => 'render_block_core_tabs',
		)
	);
}

add_action( 'init', 'register_block_core_tabs' );


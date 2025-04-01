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

function block_core_tabs_generate_gap_styles( $attributes ) {
	if ( ! array_key_exists( 'style', $attributes ) || ! is_array( $attributes['style'] ) ) {
		return '--wp--style--tabs-gap-default: 0.5em;';
	}
	// Check that 'spacing' exists and it's an array
	if ( ! array_key_exists( 'spacing', $attributes['style'] ) || ! is_array( $attributes['style']['spacing'] ) ) {
		return '--wp--style--tabs-gap-default: 0.5em;';
	}
	if ( ! array_key_exists( 'blockGap', $attributes['style']['spacing'] ) ) {
		return '--wp--style--tabs-gap-default: 0.5em;';
	}

	$orientation = array_key_exists( 'orientation', $attributes ) ? $attributes['orientation'] : 'horizontal';

	$block_gap = $attributes['style']['spacing']['blockGap'];

	$block_gap_horizontal = $block_gap['left'];
	$block_gap_vertical = $block_gap['top'];

	if ( 'vertical' === $orientation ) {
		$block_gap_horizontal = $block_gap['top'];
		$block_gap_vertical = $block_gap['left'];
	}

	$block_gap_horizontal = preg_match( '/^var:preset\|spacing\|\d+$/', $block_gap_horizontal ) ? 'var(--wp--preset--spacing--' . substr( $block_gap_horizontal, strrpos( $block_gap_horizontal, '|' ) + 1 ) . ')' : $block_gap_horizontal;
	$block_gap_vertical = preg_match( '/^var:preset\|spacing\|\d+$/', $block_gap_vertical ) ? 'var(--wp--preset--spacing--' . substr( $block_gap_vertical, strrpos( $block_gap_vertical, '|' ) + 1 ) . ')' : $block_gap_vertical;

	return wp_sprintf('--wp--style--unstable-tabs-list-gap: %s;--wp--style--unstable-tabs-gap: %s;', $block_gap_horizontal, $block_gap_vertical);
;
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
	wp_enqueue_script_module( '@wordpress/block-library/tabs/view' );

	$active_tab_index = $attributes['activeTabIndex'];

	// Cosntruct an array of the innerblocks as tabs_list.
	// We use innerblocks instead of parsing each .wp-block-tab because it scopes
	// the tab_index to just this instance of the tabs block. This allows
	// inner tabs to have unique tabs_list indexes, even if they're nested.
	$innerblocks = $block->parsed_block['innerBlocks'];
	$tab_index = 0;
	$tabs_list   = array_map(
		function ( $tab ) use ( &$tab_index ) {
			$tab_processor = new WP_HTML_Tag_Processor( $tab['innerHTML'] );
			$tab_processor->next_tag( array('class_name' => 'wp-block-tab') );
			$tab_id = $tab_processor->get_attribute('id');
			$attrs = $tab['attrs'];
			$attrs['index'] = $tab_index;
			$attrs['id'] = $tab_id;
			$tab_index++;
			return $attrs;
		},
		$innerblocks
	);

	$color_styles = block_core_tabs_generate_color_variables( $attributes );
	$gap_styles = block_core_tabs_generate_gap_styles( $attributes );

	// Modify the wrapper.
	$tag_processor = new WP_HTML_Tag_Processor( $content );
	$tag_processor->next_tag( array('class_name' => 'wp-block-tabs') );
	$tag_processor->add_class( 'vertical' === $attributes['orientation'] ? 'is-vertical' : 'is-horizontal');
	$tag_processor->set_attribute('data-wp-interactive', 'core/tabs');
	$tag_processor->set_attribute('data-wp-context', wp_json_encode(
		array(
			'activeTabIndex'         => $active_tab_index,
			'tabsList'               => $tabs_list,
		)
	));
	$style = $tag_processor->get_attribute('style');
	$style .= $color_styles;
	$style .= $gap_styles;
	$tag_processor->set_attribute('style', $style);

	$updated_content = $tag_processor->get_updated_html();

	// Drop a bookmark to get back to the start of the wrapper.
	$tag_processor->set_bookmark('tabs-start');

	$tabs_template = '<template data-wp-each--tab="context.tabsList"><li class="tabs__list-item" role="presentation"><a data-wp-bind--id="context.tab.id" class="tabs__tab-label" data-wp-bind--href="state.getTabHref" role="tab" data-wp-on--click="actions.handleTabClick" data-wp-on--keydown="actions.handleTabKeyDown" data-wp-bind--aria-selected="state.isActiveTab" data-wp-text="context.tab.label" data-wp-bind--tabindex="state.tabindexLabelAttribute"></a></li></template>';

	// Navigate to the tabs__list element.
	$tag_processor->next_tag( array(
		'class_name' => 'tabs__list',
		'tag_name' => 'ul',
	) );
	// Just in case we need this later.
	$tag_processor->set_bookmark('tabs-list-start');

	// Splice the tabs_template into the updated_content.
	$list_start_pos = strpos($updated_content, '<ul class="tabs__list"');
	if ($list_start_pos !== false) {
		$list_open_end = strpos($updated_content, '>', $list_start_pos) + 1;
		$list_close_start = strpos($updated_content, '</ul>', $list_open_end);

		$new_html = substr($updated_content, 0, $list_open_end) .
					$tabs_template .
					substr($updated_content, $list_close_start);

		// We run the content through the tag processor again to ensure
		// that the tabs_template is correctly spliced in and that in the
		// event something has gone wrong the subsqeuent get_updated_html will fail gracefully.
		$tag_processor = new WP_HTML_Tag_Processor($new_html);
	}

	$content = $tag_processor->get_updated_html();

	return $content;
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

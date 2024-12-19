<?php
/**
 * Utility functions for working with tabs.
 */

/**
 * Generate a new tab
 *
 * @param string $label The label of the tab.
 * @param string $content The content of the tab.
 * @param int    $index The index of the tab.
 * @return WP_Block_Parser_Block The tab block
 */
function generate_tab( $label, $content, $index = 0 ) {
	$parsed_content   = is_array( $content ) ? $content : parse_blocks( $content );
	$inner_html_start = wp_sprintf(
		'<section id="%s" class="wp-block-prc-block-tab">',
		sanitize_title( $label )
	);
	$inner_html_end   = '</section>';
	$inner_html       = $inner_html_start . $inner_html_end;
	$nulls            = count( $parsed_content );
	$tab_block = new WP_Block_Parser_Block(
		'core/tab',
		array(
			'label'    => $label,
			'slug'     => sanitize_title( $label ),
			'tabIndex' => $index,
		),
		$parsed_content,
		$inner_html,
		array_merge(
			array( $inner_html_start ),
			array_fill( 0, $nulls, null ),
			array( $inner_html_end )
		)
	);
	return $tab_block;
}

/**
 * Create a new set of tabs
 *
 * @param array $tabs An array of tabs to create.
 * @return array An array of blocks representing the tabs
 */
function create_tabs( $tabs = array(), $attributes = array() ) {
	$inner_html    = '';
	$inner_content = array();
	$inner_blocks  = array();
	$tab_index     = 0;

	foreach ( $tabs as $tab ) {
		$new_tab = generate_tab( $tab['label'], $tab['content'], $tab_index );
		$inner_html     .= $new_tab->innerHTML; // phpcs:ignore WordPress.NamingConventions.ValidVariableName
		$new_tab         = (array) $new_tab;
		$inner_blocks[]  = $new_tab;
		$inner_content[] = null;
		++$tab_index;
	}

	$tabs = new WP_Block_Parser_Block(
		'core/tabs',
		$attributes,
		$inner_blocks,
		'',
		$inner_content
	);

	return $tabs;
}

/**
 * Render a set of tabs
 *
 * @param array $tabs An array of tabs to render.
 * @return string The rendered tabs
 */
function render_tabs( $tabs = array(), $attributes = array() ) {
	$tabs = create_tabs( $tabs, $attributes );
	return (
		new WP_Block(
			(array) $tabs,
			array()
		)
	)->render();
}


/**
 * Example::
 *
 */
$dynamic_tabs = array(
	array(
		'label'   => 'Tab 1',
		'content' => '<!-- wp:paragraph --><p>Tab 1 content</p><!-- /wp:paragraph -->', // This can be a string representation of block markup, or an array of properly parsed innerBlocks.
	),
	array(
		'label'   => 'Tab 2',
		'content' => array(
			array(
				'blockName' => 'core/paragraph',
				'attrs'     => array(),
				'innerBlocks' => array(),
				'innerHTML' => '<p>Tab 2 content</p>',
			),
			array(
				'blockName' => 'core/image',
				'attrs'     => array(
					'url' => 'https://example.com/image.jpg',
				),
				'innerBlocks' => array(),
				'innerHTML' => '<figure class="wp-block-image"><img src="https://example.com/image.jpg" alt="" /></figure>',
			)
		)
	),
);
render_tabs( $dynamic_tabs, array( 'orientation' => 'horizontal', 'customTabBackground' => '#000000', 'customTabText' => '#ffffff' ) );

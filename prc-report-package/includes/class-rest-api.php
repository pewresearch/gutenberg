<?php
/**
 * Rest API
 *
 * @package PRC\Platform\Report_Package
 */

namespace PRC\Platform\Report_Package;

/**
 * Rest API
 *
 * @package PRC\Platform\Report_Package
 */
class Rest_API {
	/**
	 * The meta key for "chapters".
	 *
	 * @var string
	 */
	public static $package_chapters_meta_key = 'multiSectionReport';
	// @TODO: change these to snake case to `package_chapters` * when we do this, we should also adopt the Design and larger Center-wide schema for what we call "internal" or just "chapters" to be "sections". This would require changing our current core/heading language to reflect this and mass-update the existing `isChapter` attribute to `isSection`. This should be considered before finishing the lgeacy-self-healing-system @sethrubenstein

	/**
	 * The package chapters schema properties.
	 *
	 * @var array
	 */
	public static $chapters_schema_properties = array(
		'key'    => array(
			'type' => 'string',
		),
		'postId' => array(
			'type' => 'integer',
		),
	);

	/**
	 * The meta key for "parts".
	 *
	 * @var string
	 */
	public static $package_parts_meta_key = 'package_parts';

	/**
	 * The package parts schema properties.
	 *
	 * @var array
	 */
	public static $toc_parts_schema_properties = array(
		'key'   => array(
			'type'     => 'string',
			'required' => false,
		),
		'items' => array(
			'type'     => 'array',
			'required' => false,
		),
		'label' => array(
			'type'     => 'string',
			'required' => false,
		),
	);

	/**
	 * The meta key for report materials.
	 *
	 * @var string
	 */
	public static $package_materials_meta_key = 'reportMaterials';
	// @TODO: change these to snake case
	// Change this to package_materials. This is more generic, as this system could be used more broadly for "attachments" or "materials" in the future for other post types, like Fact Sheet, and Press Release.

	/**
	 * The report materials schema properties.
	 *
	 * @var array
	 */
	public static $package_materials_schema_properties = array(
		'key'          => array(
			'type'     => 'string',
			'required' => false,
		),
		'type'         => array(
			'type'     => 'string',
			'required' => false,
		),
		'url'          => array(
			'type'     => 'string',
			'required' => false,
		),
		'label'        => array(
			'type'     => 'string',
			'required' => false,
		),
		'attachmentId' => array(
			'type'     => 'integer',
			'required' => false,
		),
		'icon'         => array(
			'type'     => 'string',
			'required' => false,
		),
	);


	/**
	 * Construct the class.
	 *
	 * @param mixed $loader The loader.
	 */
	public function __construct( $loader = null ) {
		if ( null !== $loader ) {
			$this->init( $loader );
		}
	}

	/**
	 * Initialize the hooks.
	 *
	 * @param mixed $loader The loader.
	 */
	public function init( $loader ) {
		$loader->add_action( 'init', $this, 'register_meta_fields' );
		$loader->add_action( 'rest_api_init', $this, 'register_rest_fields' );
		$loader->add_filter( 'prc_api_endpoints', $this, 'register_topline_endpoint' );
	}

	/**
	 * Register the meta fields for the post report package constiuent parts (report materials, back chapters, and TOC parts).
	 */
	public function register_meta_fields() {
		// Report Materials.
		register_post_meta(
			'post',
			self::$package_materials_meta_key,
			array(
				'single'            => true,
				'type'              => 'array',
				'description'       => 'Array of package materials.',
				'show_in_rest'      => array(
					// This sanitizes the data, making sure empty keys are removed.
					'prepare_callback' => function ( $value, $rest_request ) {
						$procssed = array();
						foreach ( $value as $obj ) {
							$keys = array_keys( $obj );
							foreach ( $keys as $key ) {
								if ( empty( $obj[ $key ] ) ) {
									unset( $obj[ $key ] );
								}
							}
							$procssed[] = $obj;
						}
						return $procssed;
					},
					'schema'           => array(
						'items' => array(
							'type'       => 'object',
							'properties' => self::$package_materials_schema_properties,
						),
					),
				),
				'auth_callback'     => function () {
					return current_user_can( 'edit_posts' );
				},
				'revisions_enabled' => true,
			)
		);

		// Chapters.
		register_post_meta(
			'post',
			self::$package_chapters_meta_key,
			array(
				'single'            => true,
				'type'              => 'array',
				'description'       => 'Array of chapter objects.',
				'show_in_rest'      => array(
					'schema' => array(
						'items' => array(
							'type'       => 'object',
							'properties' => self::$chapters_schema_properties,
						),
					),
				),
				'auth_callback'     => function () {
					return current_user_can( 'edit_posts' );
				},
				'revisions_enabled' => true,
			)
		);

		// TOC "Parts".
		register_post_meta(
			'post',
			self::$package_parts_meta_key . '__enabled',
			array(
				'single'            => true,
				'type'              => 'boolean',
				'description'       => 'Whether the TOC parts are enabled.',
				'show_in_rest'      => true,
				'auth_callback'     => function () {
					return current_user_can( 'edit_posts' );
				},
				'revisions_enabled' => true,
			)
		);
		register_post_meta(
			'post',
			self::$package_parts_meta_key,
			array(
				'single'            => true,
				'type'              => 'array',
				'description'       => 'Array of TOC parts.',
				'show_in_rest'      => array(
					'schema' => array(
						'items' => array(
							'type'       => 'object',
							'properties' => self::$toc_parts_schema_properties,
						),
					),
				),
				'auth_callback'     => function () {
					return current_user_can( 'edit_posts' );
				},
				'revisions_enabled' => true,
			)
		);
	}

	/**
	 * Register the rest fields for the post report package constiuent parts (report materials, report pagination, toc, parent info).
	 * This is used in the interface and wherever useEntityProp is referencing report package data.
	 */
	public function register_rest_fields() {
		// Register the quick Table of Contents field for all public posts types.
		$public_post_types = get_post_types(
			array(
				'public' => true,
			)
		);
		foreach ( $public_post_types as $post_type ) {
			register_rest_field(
				$post_type,
				'table_of_contents',
				array(
					'get_callback' => array( $this, 'get_table_of_contents_field' ),
					'description'  => 'The table of contents for this post.',
				)
			);
		}

		// Register the other constiuent fields for the report package.
		register_rest_field(
			'post',
			'report_materials',
			array(
				'get_callback' => array( $this, 'get_report_materials_field' ),
				'description'  => 'The full report package; materials and chapters.',
			)
		);

		register_rest_field(
			'post',
			'report_pagination',
			array(
				'get_callback' => array( $this, 'get_report_pagination_field' ),
				'description'  => 'Pagination for report packages.',
			)
		);

		register_rest_field(
			'post',
			'toplines',
			array(
				'get_callback' => array( $this, 'get_toplines_field' ),
				'description'  => 'All topline materials associated with this post or its parent.',
			)
		);

		/**
		 * @TODO: We should move this somewhere more genreal...
		 */
		register_rest_field(
			'post',
			'parent_info',
			array(
				'get_callback' => array( $this, 'get_parent_info_field' ),
				'description'  => 'Parent info for a child post',
			)
		);
	}

	/**
	 * Get the table of contents for a given post.
	 *
	 * @param mixed $object The object.
	 * @return array
	 */
	public function get_table_of_contents_field( $object ) {
		$post_id = $object['id'];
		return get_package_chapters( $post_id );
	}

	/**
	 * Get the report materials for a given post.
	 *
	 * @param mixed $object The object.
	 * @return array
	 */
	public function get_report_materials_field( $object ) {
		$post_id = $object['id'];
		return get_package_materials( $post_id );
	}

	/**
	 * Get the report pagination for a given post.
	 *
	 * @param mixed $object The object.
	 * @return array
	 */
	public function get_report_pagination_field( $object ) {
		$post_id = $object['id'];
		return get_pagination( $post_id );
	}

	/**
	 * Get all topline materials for a given post.
	 * Resolves to the parent post and returns every topline material.
	 *
	 * @param mixed $object The object.
	 * @return array
	 */
	public function get_toplines_field( $object ) {
		$post_id = $object['id'];
		return get_package_toplines( $post_id );
	}

	/**
	 * Get the parent info for a given post.
	 *
	 * @param mixed $object The object.
	 * @return array
	 */
	public function get_parent_info_field( $object ) {
		$post_id   = $object['id'];
		$parent_id = get_package_id( $post_id );
		return array(
			'parent_title' => get_the_title( $parent_id ),
			'parent_id'    => $parent_id,
		);
	}

	/**
	 * Register the /topline endpoint via the prc_api_endpoints filter.
	 *
	 * @hook prc_api_endpoints
	 *
	 * @param array $endpoints Existing endpoints.
	 * @return array Modified endpoints with the topline route added.
	 */
	public function register_topline_endpoint( $endpoints ) {
		$endpoints[] = array(
			'route'    => '/topline',
			'methods'  => 'GET',
			'callback' => array( $this, 'get_topline_endpoint_callback' ),
			'args'     => array(
				'post_id' => array(
					'required'          => true,
					'type'              => 'integer',
					'description'       => 'The post ID (parent or child) to retrieve toplines for.',
					'validate_callback' => function ( $param ) {
						return is_numeric( $param );
					},
					'sanitize_callback' => 'absint',
				),
			),
		);
		return $endpoints;
	}

	/**
	 * Callback for the /topline endpoint.
	 * Returns all topline materials associated with the given post's parent package.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_topline_endpoint_callback( $request ) {
		$post_id = $request->get_param( 'post_id' );

		$post = get_post( $post_id );
		if ( ! $post ) {
			return new \WP_Error(
				'rest_post_not_found',
				'Post not found.',
				array( 'status' => 404 )
			);
		}

		$parent_id = get_package_id( $post_id );
		$toplines  = get_package_toplines( $post_id );

		return rest_ensure_response(
			array(
				'post_id'   => $post_id,
				'parent_id' => $parent_id,
				'toplines'  => $toplines,
			)
		);
	}
}
